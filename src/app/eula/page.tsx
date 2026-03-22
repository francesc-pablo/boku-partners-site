
export default function EulaPage() {
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">End-User License Agreement</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Last updated: October 26, 2023
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="max-w-4xl mx-auto space-y-6 text-muted-foreground">
          <h2 className="text-2xl font-headline font-semibold text-foreground">1. Introduction</h2>
          <p>
            This End-User License Agreement ("EULA") is a legal agreement between you and Boku Partners. This EULA governs your acquisition and use of our software ("Software") directly from Boku Partners or indirectly through a Boku Partners authorized reseller or distributor (a "Reseller").
          </p>
          <p>
            Please read this EULA carefully before completing the installation process and using the Software. It provides a license to use the Software and contains warranty information and liability disclaimers.
          </p>

          <h2 className="text-2xl font-headline font-semibold text-foreground pt-4">2. License Grant</h2>
          <p>
            Boku Partners grants you a revocable, non-exclusive, non-transferable, limited license to download, install and use the Software solely for your personal, non-commercial purposes strictly in accordance with the terms of this Agreement.
          </p>

          <h2 className="text-2xl font-headline font-semibold text-foreground pt-4">3. Restrictions</h2>
          <p>
            You agree not to, and you will not permit others to:
          </p>
          <ul className="list-disc pl-8 space-y-2">
            <li>license, sell, rent, lease, assign, distribute, transmit, host, outsource, disclose or otherwise commercially exploit the Software or make the Software available to any third party.</li>
            <li>modify, make derivative works of, disassemble, decrypt, reverse compile or reverse engineer any part of the Software.</li>
            <li>remove, alter or obscure any proprietary notice (including any notice of copyright or trademark) of Boku Partners or its affiliates, partners, suppliers or the licensors of the Software.</li>
          </ul>

          <h2 className="text-2xl font-headline font-semibold text-foreground pt-4">4. Intellectual Property</h2>
          <p>
            The Software, including without limitation all copyrights, patents, trademarks, trade secrets and other intellectual property rights are, and shall remain, the sole and exclusive property of Boku Partners.
          </p>

          <h2 className="text-2xl font-headline font-semibold text-foreground pt-4">5. Your Suggestions</h2>
          <p>
            Any feedback, comments, ideas, improvements or suggestions (collectively, "Suggestions") provided by you to Boku Partners with respect to the Software shall remain the sole and exclusive property of Boku Partners.
          </p>

          <h2 className="text-2xl font-headline font-semibold text-foreground pt-4">6. Modifications to Software</h2>
          <p>
            Boku Partners reserves the right to modify, suspend or discontinue, temporarily or permanently, the Software or any service to which it connects, with or without notice and without liability to you.
          </p>

          <h2 className="text-2xl font-headline font-semibold text-foreground pt-4">7. Term and Termination</h2>
          <p>
            This Agreement shall remain in effect until terminated by you or Boku Partners. Boku Partners may, in its sole discretion, at any time and for any or no reason, suspend or terminate this Agreement with or without prior notice.
          </p>
          <p>
            This Agreement will terminate immediately, without prior notice from Boku Partners, in the event that you fail to comply with any provision of this Agreement. You may also terminate this Agreement by deleting the Software and all copies thereof from your mobile device or from your computer.
          </p>

          <h2 className="text-2xl font-headline font-semibold text-foreground pt-4">8. Disclaimer of Warranty</h2>
          <p>
            THE SOFTWARE IS PROVIDED TO YOU "AS IS" AND "AS AVAILABLE" AND WITH ALL FAULTS AND DEFECTS WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, BOKU PARTNERS, ON ITS OWN BEHALF AND ON BEHALF OF ITS AFFILIATES AND ITS AND THEIR RESPECTIVE LICENSORS AND SERVICE PROVIDERS, EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, WITH RESPECT TO THE SOFTWARE.
          </p>

          <h2 className="text-2xl font-headline font-semibold text-foreground pt-4">9. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL BOKU PARTNERS OR ITS SUPPLIERS BE LIABLE FOR ANY SPECIAL, INCIDENTAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER (INCLUDING, BUT NOT LIMITED TO, DAMAGES FOR LOSS OF PROFITS, FOR LOSS OF DATA OR OTHER INFORMATION, FOR BUSINESS INTERRUPTION, FOR PERSONAL INJURY, FOR LOSS OF PRIVACY ARISING OUT OF OR IN ANY WAY RELATED TO THE USE OF OR INABILITY TO USE THE SOFTWARE).
          </p>
          
          <h2 className="text-2xl font-headline font-semibold text-foreground pt-4">10. Contact Information</h2>
          <p>
            If you have any questions about this Agreement, please contact us at info@bokupartners.com.
          </p>
          <p className="font-bold text-center !mt-12 text-destructive">
            Please note: This is a sample EULA and should be reviewed by a legal professional before use.
          </p>
        </div>
      </section>
    </>
  );
}
