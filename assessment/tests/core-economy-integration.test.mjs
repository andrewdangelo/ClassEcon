import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sectionBetween(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  assert.notEqual(start, -1, `Could not locate section start token: ${startToken}`);

  const end = source.indexOf(endToken, start);
  assert.notEqual(end, -1, `Could not locate section end token: ${endToken}`);

  return source.slice(start, end);
}

test("pay request lifecycle contract is wired across schema and resolver flow", () => {
  const schemaSource = read("Backend/src/schema.ts");
  const mutationSource = read("Backend/src/resolvers/Mutation.ts");

  assert.match(schemaSource, /createPayRequest\(input: CreatePayRequestInput!\): PayRequest!/);
  assert.match(schemaSource, /approvePayRequest\(id: ID!, amount: Int!, comment: String\): PayRequest!/);
  assert.match(schemaSource, /submitPayRequest\(id: ID!\): PayRequest!/);
  assert.match(schemaSource, /rebukePayRequest\(id: ID!, comment: String!\): PayRequest!/);
  assert.match(schemaSource, /denyPayRequest\(id: ID!, comment: String!\): PayRequest!/);

  const createSection = sectionBetween(
    mutationSource,
    "async createPayRequest",
    "async approvePayRequest"
  );
  assert.match(createSection, /status:\s*"SUBMITTED"/);
  assert.match(createSection, /createPayRequestNotification/);

  const approveSection = sectionBetween(
    mutationSource,
    "async approvePayRequest",
    "async submitPayRequest"
  );
  assert.match(approveSection, /requireClassTeacher\(ctx,\s*req\.classId\.toString\(\)\)/);
  assert.match(approveSection, /status:\s*"APPROVED"/);

  const submitSection = sectionBetween(
    mutationSource,
    "async submitPayRequest",
    "async rebukePayRequest"
  );
  assert.match(submitSection, /requireClassTeacher\(ctx,\s*req\.classId\.toString\(\)\)/);
  assert.match(submitSection, /Transaction\.create\(/);
  assert.match(submitSection, /type:\s*mapPayToTxType\(\)/);
  assert.match(submitSection, /status:\s*"PAID"/);

  const rebukeSection = sectionBetween(
    mutationSource,
    "async rebukePayRequest",
    "async denyPayRequest"
  );
  assert.match(rebukeSection, /Comment required for rebuke/);
  assert.match(rebukeSection, /status:\s*"REBUKED"/);

  const denySection = sectionBetween(
    mutationSource,
    "async denyPayRequest",
    "async signUp"
  );
  assert.match(denySection, /Comment required for denial/);
  assert.match(denySection, /status:\s*"DENIED"/);
});

test("store purchase and redemption lifecycle protects balance and state transitions", () => {
  const schemaSource = read("Backend/src/schema.ts");
  const mutationSource = read("Backend/src/resolvers/Mutation.ts");

  assert.match(schemaSource, /makePurchase\(input: MakePurchaseInput!\): \[Purchase!\]!/);
  assert.match(schemaSource, /createRedemptionRequest\(purchaseId: ID!, studentNote: String!\): RedemptionRequest!/);
  assert.match(schemaSource, /approveRedemption\(id: ID!, teacherComment: String!\): RedemptionRequest!/);
  assert.match(schemaSource, /denyRedemption\(id: ID!, teacherComment: String!\): RedemptionRequest!/);

  const purchaseSection = sectionBetween(
    mutationSource,
    "async makePurchase",
    "async addPayRequestComment"
  );
  assert.match(purchaseSection, /Transaction\.aggregate\(\[/);
  assert.match(purchaseSection, /if \(currentBalance < totalCost\)/);
  assert.match(purchaseSection, /Insufficient balance/);
  assert.match(purchaseSection, /\$inc:\s*\{\s*stock:\s*-item\.quantity\s*\}/);
  assert.match(purchaseSection, /type:\s*"PURCHASE"/);
  assert.match(purchaseSection, /amount:\s*-totalCost/);

  const redemptionCreateSection = sectionBetween(
    mutationSource,
    "async createRedemptionRequest",
    "async approveRedemption"
  );
  assert.match(redemptionCreateSection, /purchase\.status !== "in-backpack"/);
  assert.match(redemptionCreateSection, /status:\s*"pending"/);
  assert.match(redemptionCreateSection, /A redemption request for this item is already pending/);

  const redemptionApproveSection = sectionBetween(
    mutationSource,
    "async approveRedemption",
    "async denyRedemption"
  );
  assert.match(redemptionApproveSection, /request\.status = "approved"/);
  assert.match(redemptionApproveSection, /status:\s*"redeemed"/);

  const redemptionDenySection = sectionBetween(
    mutationSource,
    "async denyRedemption",
    "async createJob"
  );
  assert.match(redemptionDenySection, /request\.status = "denied"/);
  assert.match(redemptionDenySection, /Purchase remains in backpack when denied/);
});

test("jobs, applications, employment, and payroll posting contract is in place", () => {
  const schemaSource = read("Backend/src/schema.ts");
  const mutationSource = read("Backend/src/resolvers/Mutation.ts");
  const salaryServiceSource = read("Backend/src/services/salary.ts");

  assert.match(schemaSource, /createJob\(input: CreateJobInput!\): Job!/);
  assert.match(schemaSource, /applyForJob\(input: ApplyForJobInput!\): JobApplication!/);
  assert.match(schemaSource, /approveJobApplication\(id: ID!\): JobApplication!/);
  assert.match(schemaSource, /studentEmployments\(studentId: ID!, classId: ID!, status: EmploymentStatus\): \[Employment!\]!/);

  const applySection = sectionBetween(
    mutationSource,
    "async applyForJob",
    "async approveJobApplication"
  );
  assert.match(applySection, /role:\s*"STUDENT"/);
  assert.match(applySection, /You must be a student in this class to apply/);
  assert.match(applySection, /You have already applied for this job/);
  assert.match(applySection, /You are already employed in this job/);
  assert.match(applySection, /status:\s*"PENDING"/);

  const approveSection = sectionBetween(
    mutationSource,
    "async approveJobApplication",
    "async rejectJobApplication"
  );
  assert.match(approveSection, /Employment\.create\(/);
  assert.match(approveSection, /status:\s*"ACTIVE"/);
  assert.match(approveSection, /job\.capacity\.current \+= 1/);

  assert.match(salaryServiceSource, /export async function processSalaryPayments\(\)/);
  assert.match(salaryServiceSource, /Transaction\.create\(\{/);
  assert.match(salaryServiceSource, /type:\s*"INCOME"/);
  assert.match(salaryServiceSource, /lastPaidAt:\s*new Date\(\)/);
});

test("billing flow contract covers checkout, portal, invoices, and payment methods", () => {
  const schemaSource = read("Backend/src/schema.ts");
  const paymentResolverSource = read("Backend/src/resolvers/payment.ts");
  const paymentClientSource = read("Backend/src/services/payment-service.ts");
  const paymentRouteSource = read("PaymentService/src/routes/payments.ts");

  assert.match(schemaSource, /createPaymentCheckout\(tier: String!, interval: String!, isFoundingMember: Boolean\): PaymentCheckoutResponse!/);
  assert.match(schemaSource, /createBillingPortalSession\(returnUrl: String\): BillingPortalResponse!/);
  assert.match(schemaSource, /getInvoices\(limit: Int\): \[Invoice!\]!/);
  assert.match(schemaSource, /upcomingInvoice: JSON/);
  assert.match(schemaSource, /myPaymentMethods: \[JSON!\]!/);

  assert.match(paymentResolverSource, /PaymentServiceClient\.createCheckoutSession/);
  assert.match(paymentResolverSource, /PaymentServiceClient\.createPortalSession/);
  assert.match(paymentResolverSource, /PaymentServiceClient\.getInvoices/);
  assert.match(paymentResolverSource, /PaymentServiceClient\.getUpcomingInvoice/);
  assert.match(paymentResolverSource, /PaymentServiceClient\.getPaymentMethods/);

  assert.match(paymentClientSource, /\/api\/payments\/checkout/);
  assert.match(paymentClientSource, /\/api\/payments\/portal/);
  assert.match(paymentClientSource, /\/api\/payments\/invoices/);
  assert.match(paymentClientSource, /\/api\/payments\/upcoming-invoice/);
  assert.match(paymentClientSource, /\/api\/payments\/payment-methods/);

  assert.match(paymentRouteSource, /paymentRouter\.post\(\s*"\/checkout"/);
  assert.match(paymentRouteSource, /paymentRouter\.post\(\s*"\/portal"/);
  assert.match(paymentRouteSource, /paymentRouter\.get\(\s*"\/subscription"/);
  assert.match(paymentRouteSource, /paymentRouter\.get\(\s*"\/invoices"/);
  assert.match(paymentRouteSource, /paymentRouter\.get\(\s*"\/payment-methods"/);
  assert.match(paymentRouteSource, /paymentRouter\.get\(\s*"\/upcoming-invoice"/);
});
