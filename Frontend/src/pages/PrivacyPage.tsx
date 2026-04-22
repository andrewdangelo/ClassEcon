import { LegalDocumentShell, LegalSection } from "@/components/legal/LegalDocumentShell";

const UPDATED = "April 21, 2026";

export default function PrivacyPage() {
  return (
    <LegalDocumentShell title="Privacy Policy" updated={UPDATED}>
      <p className="rounded-lg border border-border bg-muted/30 p-4 text-muted-foreground">
        This notice explains how ClassEcon handles information. It is provided for transparency and is
        not legal advice. Schools, districts, and organizations should use their own counsel and data
        protection agreements where required.
      </p>

      <LegalSection title="Who we are">
        <p>
          ClassEcon provides classroom economy software. For data protection law purposes, the party
          identified in your order form, site notice, or contract (ClassEcon and/or its operating
          entity) acts as a <strong>processor</strong> or <strong>service provider</strong> when an
          educational institution uses the product for its students, and as a{" "}
          <strong>controller</strong> when we deal directly with account owners (for example,
          teachers who sign up individually) for billing, support, and product operation.
        </p>
        <p>
          Contact:{" "}
          <a href="mailto:privacy@classecon.com">privacy@classecon.com</a> and{" "}
          <a href="mailto:support@classecon.com">support@classecon.com</a>.
        </p>
      </LegalSection>

      <LegalSection title="FERPA (U.S. student education records)">
        <p>
          When a school or teacher uses ClassEcon with students, the school is generally the
          custodian of education records under the Family Educational Rights and Privacy Act (FERPA).
          We process such information only to provide the service the school or teacher has
          requested, consistent with our agreement and applicable law.
        </p>
        <ul>
          <li>We do not sell student personal information and we do not use it for targeted advertising.</li>
          <li>
            Access to student academic and financial-in-simulation data is limited to what the
            product needs to run (for example, class rosters, balances, jobs, and teacher/student
            roles you configure).
          </li>
          <li>
            Parents and eligible students should direct FERPA questions (inspection, amendment,
            consent) to the school, which remains responsible for education records, except where the
            law and our terms assign a task directly to us.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="CIPA and internet safety">
        <p>
          The Children’s Internet Protection Act (CIPA) imposes requirements on U.S. schools and
          libraries that receive E-rate or certain other funding, including internet safety policies,
          education about appropriate online behavior, and (for institutions subject to the
          filtering condition) technology protection measures.
        </p>
        <p>
          <strong>ClassEcon is not a general web browser, search engine, or home internet
          service.</strong> It does not replace your district’s content filtering, acceptable-use
          policy, or supervision obligations. You are responsible for how and where students access
          the service, consistent with CIPA, COPPA, and your local policies. We do not require
          students to browse the open web inside our application for core product use.
        </p>
      </LegalSection>

      <LegalSection title="GDPR and similar laws (EEA, UK, others)">
        <p>Depending on your location, you may have rights regarding personal data, including to:</p>
        <ul>
          <li>Access, correct, or delete your data, or export a copy in a portable form;</li>
          <li>Object to or restrict certain processing, or withdraw consent where processing is consent-based;</li>
          <li>Lodge a complaint with a supervisory authority.</li>
        </ul>
        <p>
          The application includes tools to <strong>download a machine-readable export</strong> of
          the personal data associated with your account, and to <strong>request account
          deletion</strong>, when permitted by your role and the integrity of class data (for example,
          school staff may need to move or archive classes first). Where a school is the data
          controller, we may need to work through that organization.
        </p>
        <p>
          <strong>Legal bases (where GDPR applies) may include:</strong> performance of a contract
          with you; legitimate interests in operating, securing, and improving the product (balanced
          against your rights); and, where we ask, consent. Subprocessing is governed by
          school-facing agreements where applicable.
        </p>
        <p>
          If we transfer data outside the European Economic Area, we do so with appropriate
          safeguards (for example, standard contractual clauses) as required by law.
        </p>
      </LegalSection>

      <LegalSection title="Data we process">
        <p>Examples include: account and profile data (name, email, role); class and school context you enter; in-app activity needed to run the economy (balances, jobs, pay requests, store activity); authentication and security data; and support and billing data when you purchase paid plans.</p>
        <p>We use strict access controls, encryption in transit, and other safeguards appropriate to the service.</p>
      </LegalSection>

      <LegalSection title="Cookies and similar technologies">
        <p>
          We use session and security-related cookies (including HTTP-only refresh cookies, where
          applicable) to keep you signed in and protect your account. We do not use non-essential
          third-party advertising cookies in the product core; if that changes, we will update this
          notice and any consent experience as required.
        </p>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          We keep information only as long as needed to provide the service, comply with law,
          resolve disputes, and enforce agreements. Schools and administrators may have separate
          retention rules for official education records; align those with this product through
          your organization’s process.
        </p>
      </LegalSection>

      <LegalSection title="Breach notification">
        <p>
          Where the law requires it, we will notify affected customers and, when appropriate,
          individuals or regulators, without undue delay after we become aware of a personal data
          breach affecting the information we process as a controller.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          The product is designed for use under adult or school direction. If you believe a child has
          provided us information without appropriate authority, contact us and we will take
          appropriate steps.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>We may update this policy. Material changes will be posted here with a new “last updated” date. Continued use of the service after changes means you acknowledge the update where permitted by law.</p>
      </LegalSection>
    </LegalDocumentShell>
  );
}
