import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/claim_provider.dart';
import '../models/claim.dart';

class AddEditClaimScreen extends StatefulWidget {
  final String? claimId;

  const AddEditClaimScreen({super.key, this.claimId});

  @override
  _AddEditClaimScreenState createState() => _AddEditClaimScreenState();
}

class _AddEditClaimScreenState extends State<AddEditClaimScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _patientNameController;
  ClaimStatus _selectedStatus = ClaimStatus.draft;

  @override
  void initState() {
    super.initState();
    final claimProvider = Provider.of<ClaimProvider>(context, listen: false);
    final claim = widget.claimId != null ? claimProvider.getClaimById(widget.claimId!) : null;
    _patientNameController = TextEditingController(text: claim?.patientName ?? '');
    _selectedStatus = claim?.status ?? ClaimStatus.draft;
  }

  @override
  void dispose() {
    _patientNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final claimProvider = Provider.of<ClaimProvider>(context, listen: false);
    final isEditing = widget.claimId != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Claim' : 'Add Claim'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _patientNameController,
                decoration: const InputDecoration(labelText: 'Patient Name'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter patient name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<ClaimStatus>(
                value: _selectedStatus,
                decoration: const InputDecoration(labelText: 'Status'),
                items: ClaimStatus.values.map((status) {
                  return DropdownMenuItem(
                    value: status,
                    child: Text(status.toString().split('.').last),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedStatus = value!;
                  });
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    final claim = Claim(
                      id: widget.claimId ?? DateTime.now().millisecondsSinceEpoch.toString(),
                      patientName: _patientNameController.text,
                      status: _selectedStatus,
                    );
                    if (isEditing) {
                      claimProvider.updateClaim(claim);
                    } else {
                      claimProvider.addClaim(claim);
                    }
                    Navigator.pop(context);
                  }
                },
                child: Text(isEditing ? 'Update Claim' : 'Add Claim'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
