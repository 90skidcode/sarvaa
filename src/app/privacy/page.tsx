import { Badge } from '@/components/ui/badge'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <Badge className="mb-4 bg-[#743181]">Legal</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">Privacy Policy</h1>
          
          <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p>This Privacy Policy describes how <strong>SARVAA SWEETS</strong> and its affiliates (collectively "SARVAA SWEETS, we, our, us") collect, use, share, protect or otherwise process your information/personal data through our website <a href="https://sarvaasweetsandcakes.com/" className="text-[#743181] hover:underline">https://sarvaasweetsandcakes.com/</a> (hereinafter referred to as "Platform").</p>
              <p>By visiting this Platform, providing your information or availing any product/service offered on the Platform, you expressly agree to be bound by the terms of this Privacy Policy, Terms of Use and the applicable service/product terms. If you do not agree, please do not use or access our Platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Collection</h2>
              <p>We collect your personal data when you use our Platform, services, or otherwise interact with us. This may include, but is not limited to: name, date of birth, address, phone number, email, identity/address proofs, bank/payment details, biometric information, etc. You may choose not to provide information, however, this may limit your access to some services.</p>
              <p>We also track user behavior and preferences in aggregate. Any data collected through third-party partners will be governed by their privacy policies.</p>
              <p className="bg-pink-50 p-4 rounded-lg border-l-4 border-[#743181]">
                <strong>Important:</strong> SARVAA SWEETS will never request sensitive data such as card PINs or banking passwords. Please report any such instances to law enforcement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage</h2>
              <p>We use your personal data to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide requested services</li>
                <li>Assist sellers and business partners</li>
                <li>Enhance customer experience</li>
                <li>Resolve disputes and troubleshoot issues</li>
                <li>Inform you about offers and updates</li>
                <li>Customize and improve services</li>
                <li>Conduct marketing and research</li>
                <li>Ensure compliance with legal requirements</li>
              </ul>
              <p>You may opt-out of marketing communications at any time.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sharing</h2>
              <p>Your personal data may be shared with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Our corporate group and affiliates</li>
                <li>Sellers, logistics and payment service providers</li>
                <li>Third-party reward/marketing partners</li>
                <li>Government or law enforcement agencies, if required</li>
              </ul>
              <p>Sharing will occur only as required for services, legal obligations, fraud prevention, and user protection.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Precautions</h2>
              <p>We implement reasonable security practices to protect your data. While we ensure safe storage and access to your account, data transmission over the internet may still carry inherent risks. Users are responsible for maintaining the confidentiality of their login credentials.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Deletion and Retention</h2>
              <p>You may delete your account from the profile settings section. If deletion is requested, we may retain certain data as required by law or for legitimate business reasons. Data may be anonymized and retained for analysis even after account deletion.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p>You may access, update, or rectify your personal data through the Platform's provided tools.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Consent</h2>
              <p>By using our Platform, you consent to data collection, usage, and sharing as outlined here. If providing data on behalf of others, you affirm having the authority to do so.</p>
              <p>You may withdraw consent by contacting the Grievance Officer with the subject “Withdrawal of consent for processing personal data”. Such requests may be verified and are subject to our Terms of Use and applicable laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to this Privacy Policy</h2>
              <p>We may update this Privacy Policy to reflect changes in practices or law. Please review it periodically. Notifications will be provided as required by law.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
