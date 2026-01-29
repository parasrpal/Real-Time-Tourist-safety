import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/claim_provider.dart';
import '../models/claim.dart';
import 'claim_detail_screen.dart';
import 'add_edit_claim_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Insurance Claims Dashboard'),
      ),
      body: Consumer<ClaimProvider>(
        builder: (context, claimProvider, child) {
          final claims = claimProvider.claims;
          if (claims.isEmpty) {
            return const Center(
              child: Text('No claims yet. Add a new claim to get started.'),
            );
          }
          return ListView.builder(
            itemCount: claims.length,
            itemBuilder: (context, index) {
              final claim = claims[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text(claim.patientName),
                  subtitle: Text('Status: ${claim.status.toString().split('.').last}'),
                  trailing: Text('\$${claim.pendingAmount.toStringAsFixed(2)}'),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ClaimDetailScreen(claimId: claim.id),
                      ),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const AddEditClaimScreen(),
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
