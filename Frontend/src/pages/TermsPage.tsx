import { LegalDocumentShell, LegalSection } from "@/components/legal/LegalDocumentShell";

const UPDATED = "April 21, 2026";

export default function TermsPage() {
  return (
    <LegalDocumentShell title="Terms of Service" updated={UPDATED}>
      <p className="rounded-lg border border-border bg-muted/30 p-4 text-muted-foreground">
        These terms govern use of the ClassEcon service. If you are using the product on behalf of
        a school or district, a separate order or data processing agreement may also apply. These
        terms are not a substitute for legal review by your organization.
      </p>

      <LegalSection title="The service">
        <p>
          ClassEcon provides a configurable classroom economy (balances, store, jobs, requests, and
          related features). We improve and change the product over time; we will give reasonable
          notice of material changes when we can.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree to use the service only in compliance with law and with school or district rules where applicable. You will not attempt to break security, access others’ data without authorization, or use the product in a way that endangers students or other users.</p>
      </LegalSection>

      <LegalSection title="Accounts, security, and education compliance">
        <p>You are responsible for your credentials and for activity under your account. You must provide accurate information and keep it current.</p>
        <p>
          Where FERPA, COPPA, state student privacy laws, or comparable rules apply, the school is
          typically responsible for consent, records, and policy. You represent that you have
          authority to use student information in the product as configured.
        </p>
      </LegalSection>

      <LegalSection title="Subscribers and payment">
        <p>Features, limits, and fees are described in-app and at checkout. Recurring plans renew until cancelled through the billing self-service or as stated at purchase. Taxes may apply. Failure to pay may result in limited or suspended access in line with the payment terms we display.</p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>We retain all rights in the software, branding, and materials we provide. You keep rights in the content you enter; you grant us a license to host and process that content to run the service for you.</p>
      </LegalSection>

      <LegalSection title="Disclaimers and limitation of liability">
        <p>
          <strong>THE SERVICE IS PROVIDED “AS IS” TO THE MAXIMUM EXTENT PERMITTED BY LAW.</strong>{" "}
          WE DO NOT WARRANT UNINTERRUPTED OR ERROR-FREE OPERATION. TO THE FULLEST EXTENT PERMITTED, WE
          ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
          FOR LOST PROFITS, DATA, OR GOODWILL. OUR AGGREGATE LIABILITY FOR CLAIMS ARISING OUT OF THE
          SERVICE IN ANY TWELVE-MONTH PERIOD IS LIMITED TO THE GREATER OF (A) THE AMOUNT YOU PAID US
          FOR THE SERVICE IN THAT PERIOD, OR (B) ONE HUNDRED DOLLARS (US $100), EXCEPT WHERE THE LAW
          DOES NOT ALLOW SUCH A CAP. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN THOSE
          CASES OUR LIABILITY IS LIMITED TO THE MINIMUM AMOUNT THE LAW REQUIRES.
        </p>
      </LegalSection>

      <LegalSection title="Indemnity">
        <p>To the extent permitted by law, you will defend and indemnify us against third-party claims and costs related to your misuse of the service, your content, or your violation of these terms, subject to your rights under law.</p>
      </LegalSection>

      <LegalSection title="Suspension and termination">
        <p>We may suspend or terminate access for material breach, risk to security or other users, or as required by law. You may stop using the service at any time. Data handling on termination is described in our privacy policy; certain records may be retained as the law or your school’s obligations require.</p>
      </LegalSection>

      <LegalSection title="Governing law and disputes">
        <p>
          Unless a separate agreement with your organization says otherwise, these terms are
          governed by the laws of the jurisdiction of our operating entity, without regard to
          conflict-of-law rules. Courts in that jurisdiction have exclusive subject-matter
          jurisdiction except where the law of your country or state gives you a mandatory local
          forum.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          <a href="mailto:support@classecon.com">support@classecon.com</a>
        </p>
      </LegalSection>
    </LegalDocumentShell>
  );
}
