import 'package:flutter/foundation.dart';
import '../models/claim.dart';

class ClaimProvider with ChangeNotifier {
  List<Claim> _claims = [];

  List<Claim> get claims => _claims;

  Claim? getClaimById(String id) {
    return _claims.firstWhere((claim) => claim.id == id);
  }

  void addClaim(Claim claim) {
    _claims.add(claim);
    notifyListeners();
  }

  void updateClaim(Claim updatedClaim) {
    final index = _claims.indexWhere((claim) => claim.id == updatedClaim.id);
    if (index != -1) {
      _claims[index] = updatedClaim;
      notifyListeners();
    }
  }

  void deleteClaim(String id) {
    _claims.removeWhere((claim) => claim.id == id);
    notifyListeners();
  }

  void updateClaimStatus(String claimId, ClaimStatus newStatus) {
    final claim = getClaimById(claimId);
    if (claim != null) {
      claim.status = newStatus;
      notifyListeners();
    }
  }

  void addBill(String claimId, Bill bill) {
    final claim = getClaimById(claimId);
    if (claim != null && bill.amount >= 0) {
      claim.bills.add(bill);
      claim.calculatePendingAmount();
      claim.updateStatus();
      final index = _claims.indexWhere((c) => c.id == claimId);
      _claims[index] = claim;
      notifyListeners();
    }
  }

  void updateBill(String claimId, Bill updatedBill) {
    final claim = getClaimById(claimId);
    if (claim != null) {
      final index = claim.bills.indexWhere((bill) => bill.id == updatedBill.id);
      if (index != -1) {
        claim.bills[index] = updatedBill;
        claim.calculatePendingAmount();
        notifyListeners();
      }
    }
  }

  void deleteBill(String claimId, String billId) {
    final claim = getClaimById(claimId);
    if (claim != null) {
      claim.bills.removeWhere((bill) => bill.id == billId);
      claim.calculatePendingAmount();
      claim.updateStatus();
      notifyListeners();
    }
  }

  void addAdvance(String claimId, Advance advance) {
    final claim = getClaimById(claimId);
    if (claim != null && advance.amount >= 0 && advance.amount <= claim.pendingAmount) {
      claim.advances.add(advance);
      claim.calculatePendingAmount();
      claim.updateStatus();
      final index = _claims.indexWhere((c) => c.id == claimId);
      _claims[index] = claim;
      notifyListeners();
    }
  }

  void addSettlement(String claimId, Settlement settlement) {
    final claim = getClaimById(claimId);
    if (claim != null && settlement.amount >= 0 && settlement.amount <= claim.pendingAmount) {
      claim.settlements.add(settlement);
      claim.calculatePendingAmount();
      claim.updateStatus();
      final index = _claims.indexWhere((c) => c.id == claimId);
      _claims[index] = claim;
      notifyListeners();
    }
  }
}
