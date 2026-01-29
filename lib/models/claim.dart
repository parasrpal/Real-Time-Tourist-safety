enum ClaimStatus { draft, submitted, approved, rejected, partiallySettled, settled, open }

class Claim {
  String id;
  String patientName;
  ClaimStatus status;
  List<Bill> bills;
  List<Advance> advances;
  List<Settlement> settlements;
  double pendingAmount;

  Claim({
    required this.id,
    required this.patientName,
    this.status = ClaimStatus.draft,
    this.bills = const [],
    this.advances = const [],
    this.settlements = const [],
    this.pendingAmount = 0.0,
  });

  double get totalBills => bills.fold(0.0, (sum, bill) => sum + bill.amount);
  double get totalAdvances => advances.fold(0.0, (sum, advance) => sum + advance.amount);
  double get totalSettlements => settlements.fold(0.0, (sum, settlement) => sum + settlement.amount);

  void calculatePendingAmount() {
    pendingAmount = totalBills - totalAdvances - totalSettlements;
  }

  void updateStatus() {
    if (pendingAmount == 0) {
      status = ClaimStatus.settled;
    } else if (pendingAmount > 0 && totalSettlements > 0) {
      status = ClaimStatus.partiallySettled;
    } else {
      status = ClaimStatus.open;
    }
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'patientName': patientName,
        'status': status.toString(),
        'bills': bills.map((b) => b.toJson()).toList(),
        'advances': advances.map((a) => a.toJson()).toList(),
        'settlements': settlements.map((s) => s.toJson()).toList(),
        'pendingAmount': pendingAmount,
      };

  factory Claim.fromJson(Map<String, dynamic> json) => Claim(
        id: json['id'],
        patientName: json['patientName'],
        status: ClaimStatus.values.firstWhere((e) => e.toString() == json['status']),
        bills: (json['bills'] as List).map((b) => Bill.fromJson(b)).toList(),
        advances: (json['advances'] as List).map((a) => Advance.fromJson(a)).toList(),
        settlements: (json['settlements'] as List).map((s) => Settlement.fromJson(s)).toList(),
        pendingAmount: json['pendingAmount'],
      );
}

class Bill {
  String id;
  String description;
  double amount;
  DateTime date;

  Bill({
    required this.id,
    required this.description,
    required this.amount,
    required this.date,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'description': description,
        'amount': amount,
        'date': date.toIso8601String(),
      };

  factory Bill.fromJson(Map<String, dynamic> json) => Bill(
        id: json['id'],
        description: json['description'],
        amount: json['amount'],
        date: DateTime.parse(json['date']),
      );
}

class Advance {
  String id;
  double amount;
  DateTime date;
  String remarks;

  Advance({
    required this.id,
    required this.amount,
    required this.date,
    this.remarks = '',
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'amount': amount,
        'date': date.toIso8601String(),
        'remarks': remarks,
      };

  factory Advance.fromJson(Map<String, dynamic> json) => Advance(
        id: json['id'],
        amount: json['amount'],
        date: DateTime.parse(json['date']),
        remarks: json['remarks'] ?? '',
      );
}

class Settlement {
  String id;
  double amount;
  DateTime date;
  String remarks;

  Settlement({
    required this.id,
    required this.amount,
    required this.date,
    this.remarks = '',
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'amount': amount,
        'date': date.toIso8601String(),
        'remarks': remarks,
      };

  factory Settlement.fromJson(Map<String, dynamic> json) => Settlement(
        id: json['id'],
        amount: json['amount'],
        date: DateTime.parse(json['date']),
        remarks: json['remarks'] ?? '',
      );
}
