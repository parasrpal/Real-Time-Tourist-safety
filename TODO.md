# TODO: Implement Auto-Update Totals and Status in Claim App

## Step 1: Update ClaimStatus Enum
- Add 'Settled' and 'Open' to ClaimStatus enum in lib/models/claim.dart

## Step 2: Add Remarks to Advance and Settlement Models
- Add 'remarks' field to Advance class in lib/models/claim.dart
- Add 'remarks' field to Settlement class in lib/models/claim.dart
- Update toJson and fromJson methods accordingly

## Step 3: Add Status Update Method in Claim Model
- Add updateStatus() method in Claim class to set status based on pending amount and settlements

## Step 4: Update Provider Methods
- Modify addBill, updateBill, deleteBill, addAdvance, addSettlement in lib/providers/claim_provider.dart
- Call updateStatus() after calculatePendingAmount()
- Add validation for no negative values and settlement <= pending

## Step 5: Create Modal Dialogs for Advances and Settlements
- Add "Add Advance Amount" button in ClaimDetailScreen
- Add "Add Settlement Amount" button in ClaimDetailScreen
- Create modal forms with amount, date, remarks fields
- Integrate with provider to add advances/settlements

## Step 6: Update UI to Show Remarks
- Update advances and settlements lists in ClaimDetailScreen to display remarks
