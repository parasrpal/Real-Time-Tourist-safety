import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/claim_provider.dart';
import '../models/claim.dart';

class AddEditBillScreen extends StatefulWidget {
  final String claimId;
  final String? billId;

  const AddEditBillScreen({super.key, required this.claimId, this.billId});

  @override
  _AddEditBillScreenState createState() => _AddEditBillScreenState();
}

class _AddEditBillScreenState extends State<AddEditBillScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _descriptionController;
  late TextEditingController _amountController;
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    final claimProvider = Provider.of<ClaimProvider>(context, listen: false);
    final claim = claimProvider.getClaimById(widget.claimId);
    final bill = widget.billId != null ? claim?.bills.firstWhere((b) => b.id == widget.billId) : null;
    _descriptionController = TextEditingController(text: bill?.description ?? '');
    _amountController = TextEditingController(text: bill?.amount.toString() ?? '');
    _selectedDate = bill?.date ?? DateTime.now();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final claimProvider = Provider.of<ClaimProvider>(context, listen: false);
    final isEditing = widget.billId != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Bill' : 'Add Bill'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(labelText: 'Description'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter description';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _amountController,
                decoration: const InputDecoration(labelText: 'Amount'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter amount';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Please enter a valid number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text('Date: ${_selectedDate.toString().split(' ')[0]}'),
                  const SizedBox(width: 16),
                  ElevatedButton(
                    onPressed: () => _selectDate(context),
                    child: const Text('Select Date'),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    final bill = Bill(
                      id: widget.billId ?? DateTime.now().millisecondsSinceEpoch.toString(),
                      description: _descriptionController.text,
                      amount: double.parse(_amountController.text),
                      date: _selectedDate,
                    );
                    if (isEditing) {
                      claimProvider.updateBill(widget.claimId, bill);
                    } else {
                      claimProvider.addBill(widget.claimId, bill);
                    }
                    Navigator.pop(context);
                  }
                },
                child: Text(isEditing ? 'Update Bill' : 'Add Bill'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
