import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/claim_provider.dart';
import '../models/claim.dart';
import 'add_edit_bill_screen.dart';

class ClaimDetailScreen extends StatefulWidget {
  final String claimId;

  const ClaimDetailScreen({super.key, required this.claimId});

  @override
  _ClaimDetailScreenState createState() => _ClaimDetailScreenState();
}

class _ClaimDetailScreenState extends State<ClaimDetailScreen> {
  @override
  Widget build(BuildContext context) {
    return Consumer<ClaimProvider>(
      builder: (context, claimProvider, child) {
        final claim = claimProvider.getClaimById(widget.claimId);
        if (claim == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Claim Not Found')),
            body: const Center(child: Text('Claim not found')),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: Text('Claim for ${claim.patientName}'),
            actions: [
              PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == 'submit') {
                    claimProvider.updateClaimStatus(widget.claimId, ClaimStatus.submitted);
                  } else if (value == 'approve') {
                    claimProvider.updateClaimStatus(widget.claimId, ClaimStatus.approved);
                  } else if (value == 'reject') {
                    claimProvider.updateClaimStatus(widget.claimId, ClaimStatus.rejected);
                  } else if (value == 'partially_settle') {
                    claimProvider.updateClaimStatus(widget.claimId, ClaimStatus.partiallySettled);
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(value: 'submit', child: Text('Submit')),
                  const PopupMenuItem(value: 'approve', child: Text('Approve')),
                  const PopupMenuItem(value: 'reject', child: Text('Reject')),
                  const PopupMenuItem(value: 'partially_settle', child: Text('Partially Settle')),
                ],
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Status: ${claim.status.toString().split('.').last}', style: const TextStyle(fontSize: 18)),
                const SizedBox(height: 16),
                Text('Total Bills: \$${claim.totalBills.toStringAsFixed(2)}'),
                Text('Total Advances: \$${claim.totalAdvances.toStringAsFixed(2)}'),
                Text('Total Settlements: \$${claim.totalSettlements.toStringAsFixed(2)}'),
                Text('Pending Amount: \$${claim.pendingAmount.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                const Text('Bills:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ...claim.bills.map((bill) => ListTile(
                  title: Text(bill.description),
                  subtitle: Text('${bill.date.toString().split(' ')[0]}'),
                  trailing: Text('\$${bill.amount.toStringAsFixed(2)}'),
                )),
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => AddEditBillScreen(claimId: widget.claimId),
                      ),
                    );
                  },
                  child: const Text('Add Bill'),
                ),
                const SizedBox(height: 24),
                const Text('Advances:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ElevatedButton(
                  onPressed: () => _showAddAdvanceDialog(context, claimProvider, widget.claimId),
                  child: const Text('Add Advance Amount'),
                ),
                const SizedBox(height: 16),
                ...claim.advances.map((advance) => ListTile(
                  title: Text('Advance'),
                  subtitle: Text('${advance.date.toString().split(' ')[0]} - ${advance.remarks}'),
                  trailing: Text('\$${advance.amount.toStringAsFixed(2)}'),
                )),
                const SizedBox(height: 24),
                const Text('Settlements:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ElevatedButton(
                  onPressed: () => _showAddSettlementDialog(context, claimProvider, widget.claimId, claim.pendingAmount),
                  child: const Text('Add Settlement Amount'),
                ),
                const SizedBox(height: 16),
                ...claim.settlements.map((settlement) => ListTile(
                  title: Text('Settlement'),
                  subtitle: Text('${settlement.date.toString().split(' ')[0]} - ${settlement.remarks}'),
                  trailing: Text('\$${settlement.amount.toStringAsFixed(2)}'),
                )),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showAddAdvanceDialog(BuildContext context, ClaimProvider claimProvider, String claimId) {
    final _amountController = TextEditingController();
    final _remarksController = TextEditingController();
    DateTime _selectedDate = DateTime.now();
    String? _errorMessage;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Advance'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _amountController,
                decoration: InputDecoration(
                  labelText: 'Amount',
                  errorText: _errorMessage,
                ),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: _remarksController,
                decoration: const InputDecoration(labelText: 'Remarks'),
              ),
              Row(
                children: [
                  Text('Date: ${_selectedDate.toString().split(' ')[0]}'),
                  IconButton(
                    icon: const Icon(Icons.calendar_today),
                    onPressed: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime(2000),
                        lastDate: DateTime(2101),
                      );
                      if (picked != null) {
                        setState(() {
                          _selectedDate = picked;
                        });
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                final amount = double.tryParse(_amountController.text);
                if (amount == null || amount < 0) {
                  setState(() {
                    _errorMessage = 'Please enter a valid positive amount';
                  });
                } else {
                  final advance = Advance(
                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                    amount: amount,
                    date: _selectedDate,
                    remarks: _remarksController.text,
                  );
                  claimProvider.addAdvance(claimId, advance);
                  Navigator.pop(context);
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddSettlementDialog(BuildContext context, ClaimProvider claimProvider, String claimId, double pendingAmount) {
    final _amountController = TextEditingController();
    final _remarksController = TextEditingController();
    DateTime _selectedDate = DateTime.now();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Settlement'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _amountController,
                decoration: const InputDecoration(labelText: 'Amount'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: _remarksController,
                decoration: const InputDecoration(labelText: 'Remarks'),
              ),
              Row(
                children: [
                  Text('Date: ${_selectedDate.toString().split(' ')[0]}'),
                  IconButton(
                    icon: const Icon(Icons.calendar_today),
                    onPressed: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime(2000),
                        lastDate: DateTime(2101),
                      );
                      if (picked != null) {
                        setState(() {
                          _selectedDate = picked;
                        });
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                final amount = double.tryParse(_amountController.text);
                if (amount != null && amount >= 0 && amount <= pendingAmount) {
                  final settlement = Settlement(
                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                    amount: amount,
                    date: _selectedDate,
                    remarks: _remarksController.text,
                  );
                  claimProvider.addSettlement(claimId, settlement);
                  Navigator.pop(context);
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }
}
