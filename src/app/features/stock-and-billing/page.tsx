import { IconBrain, IconClockHour4, IconMessage, IconClipboardList, IconHeartHandshake, IconFileText, IconStethoscope, IconReceipt, IconBookmark, IconPackages, IconClipboardPlus, IconBuildingWarehouse, IconAlertTriangle } from "@tabler/icons-react";
import { b2bBookDemoHref } from "@/lib/b2b-hub/seo";
export default function ClinicManagementSoftwarePage() {
  const bookDemoHref = b2bBookDemoHref();
  const BookDemoButton = () => (
    <a
      href={bookDemoHref}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-lg px-6 py-3 bg-black text-base font-medium text-white hover:bg-neutral-800 transition-colors"
    >
      BOOK DEMO
    </a>
  );
  const featuresList = [
    {
      name: "Messaging",
      icon: IconMessage,
    },
    {
      name: "Memory Jog",
      icon: IconBrain,
    },
    {
      name: "Waiting List",
      icon: IconClockHour4,
    },
    {
      name: "Questionnaire Builder",
      icon: IconClipboardList,
    },
    {
      name: "Engage your patients",
      icon: IconHeartHandshake,
    },
    {
      name: "Treatment Notes",
      icon: IconFileText,
    },
    {
      name: "Clinicians",
      icon: IconStethoscope,
    },
  ];
  
  return (
    <main>
      <section className="bg-white-10 py-6 md:py-10 bg-[var(--primary-bg-color)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid mb-10 md:grid-cols-2 gap-4 items-center">
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-3xl text-center md:text-left font-medium mb-7">
                Stock and Billing Management Software for Clinics
              </h2>
              <p className="mb-4 text-gray-700">
                With Consentz’s advance technology it’s easy to use Stock and Billing management system that eliminates manual work and improves your efficiency.
              </p>

              <div className="max-w-4xl m-auto mt-5 flex flex-col sm:flex-row items-center justify-start  gap-3">
                <a
                  className=" w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-center text-white hover:bg-neutral-800 transition-colors"
                  href="/directory/account/login/"
                >
                  Join as a patient — it's free
                </a>

                <a
                  className="inline-flex h-auto w-full md:w-auto items-center justify-center gap-2 rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors"
                  href="/directory/register/clinic/"
                >
                  List your practice
                </a>
              </div>
            </div>
            <div className="flex justify-end">
              <img
                src="/directory/images/sbb.png"
                alt="Healthcare dashboard on laptop"
                className="max-w-full mr-[-30px] mt-4 md:mr-0 md:mt-0"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white-50 py-15 md:py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 align-items-center">
          {featuresList.map((feature) => {
            const Icon = feature.icon;

            return (
              <div className="text-center" key={feature.name}>
                <div className="flex m-auto mb-2 items-center justify-center w-[80px] h-[80px] rounded-full bg-gray-200">
                  <Icon stroke={1.5} className="w-8 h-8 text-primary" />
                </div>
                <p className="text-gray-700">{feature.name}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white-10 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid mb-10 md:grid-cols-2 gap-4 items-center">
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl text-center md:text-left font-medium mb-7">
                Billing
              </h2>
              <p className="text-gray-700">
                Passing pieces of paper to your practice manager to charge the patient? With Consentz Stock and Billing management software you can start the billing process on your iPad and any office member can complete the invoice from their desktop. So if your patient sees something they like, you can just add it to the bill.
              </p>
              <div className="flex justify-center md:justify-start pt-5">
                <BookDemoButton />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/srb-1.png"
                alt="Healthcare dashboard on laptop"
                className="max-w-full mr-[-30px] mt-4 md:mr-0 md:mt-0"
              />
            </div>
            
          </div>
        </div>
      </section>

      <section className="bg-white-10 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconReceipt stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4"> 
                Billing Patient Journey
              </h3>
              <p className="text-gray-700">
                Straightforward billing of products, treatments, discounts and vouchers. Sales are easily allocated to the different clinicians who served the patient, from consultation to treatment.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconBookmark stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Courses of Treatments
              </h3>
              <p className="text-gray-700">
                Take pre-payments for a course of treatments, recognise clinicians who carry out the treatments, view and reassign prepaid balances if needed.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconPackages stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Bundles
              </h3>
              <p className="text-gray-700">
                Create bundles of products and treatments to entice your patients with better deals and seasonal offers.
              </p>
            </div>
          </div>
        </div>
      </section>
     
      <section className="bg-white-10 py-6 md:py-10">
        <div className="max-w-7xl m-auto px-3">
            <h2
              id="provider-steps-heading"
              className="text-xl md:text-3xl font-medium text-center mb-6"
            >
              Stock
            </h2>
            <p className="text-center m-auto text-gray-700 mb-8 max-w-3xl">
              Manage your stock, from Botulinum levels to pots of cream. Simple to set up, yet powerful enough to allow an overview of what you own. Our dynamic stock management system automatically updates with every invoice raised, or adjust it manually to record breakages, so you’ll always know what’s on your shelves.
            </p>

            <div className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">

              <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
                <div className="flex mb-4 items-center justify-center w-[80px] h-[80px] rounded-full bg-gray-200">
                  <IconClipboardPlus stroke={1.5} size={36}  />
                </div>
                <h3 className="text-xl md:text-lg font-medium mb-4">Stock Level Reports</h3>
                <p className="text-gray-700">Have you ever wanted to manage your stock levels of Botulinum Toxin? With Consentz you can see how much stock your clinicians are using and place the necessary orders.</p>
              </div>

              <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
                <div className="flex mb-4 items-center justify-center w-[80px] h-[80px] rounded-full bg-gray-200">
                  <IconBuildingWarehouse stroke={1.5} size={36} />
                </div>
                <h3 className="text-xl md:text-lg font-medium mb-4">Stock Reduction</h3>
                <p>Reduce stock numbers whenever you invoice an item, allow your Practitioner’s record usage when marking photograph, or manually enter an adjustment amount. Either way the history of all stock movements are recorded.</p>
              </div>

              <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
                <div className="flex mb-4 items-center justify-center w-[80px] h-[80px] rounded-full bg-gray-200">
                  <IconAlertTriangle stroke={1.5} size={36} />
                </div>
                <h3 className="text-xl md:text-lg font-medium mb-4">Warnings</h3>
                <p>Running low on stock? Dynamic reports and settings for minimum stock levels will inform you when you’re running out and need to reorder.</p>
              </div>

            </div>
          </div>
      </section>

    </main>
  );
}
