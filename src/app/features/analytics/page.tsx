import { b2bBookDemoHref } from "@/lib/b2b-hub/seo";
import { IconArrowNarrowUp, IconBrain, IconChartLine, IconCurrencyDollar, IconClipboard, IconClock, IconFileText, IconHeartHandshake, IconMessage, IconStethoscope, IconTrophy, IconRoute, IconTarget, IconBook, IconSearch, IconSunHigh } from "@tabler/icons-react";
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
      icon: IconClock,
    },
    {
      name: "Questionnaire Builder",
      icon: IconClipboard,
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
                Reporting and Analytics for Medical Sector
              </h2>
              <p className="mb-4 text-gray-700">
                Improving your business always starts with understanding your data. But how can you achieve this with information stored in filing cabinets or on isolated computers? With Consentz you have access to reporting and analytics that spans your business, including appointments, treatments and billing. Select and display the information you want to see.
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
                src="/directory/images/prb.png"
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
            <div className="flex justify-center">
              <img
                src="/directory/images/brb.png"
                alt="Healthcare dashboard on laptop"
                className="max-w-full mr-[-30px] mt-4 md:mr-0 md:mt-0"
              />
            </div>
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl text-center md:text-left font-medium mb-7">
                Reporting the Pulse of Your Business
              </h2>
              <p className="text-gray-700">
                The Reporting section allows you to select and view multiple reports, graphs and tables that measure the health of your clinic. These are dynamic medical reports, which can be customized to your needs and are updated in real-time, so you can see at a glance how well your business is doing.
              </p>
              <div className="flex justify-center md:justify-start pt-5">
                <BookDemoButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white-10 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconArrowNarrowUp stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4">Filters & Variables</h3>
              <p className="text-gray-700">
                Customisable options enable you to select the key variables you need to track, be it the number of specific treatments administered last month or the names of your best practitioners.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconChartLine stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Better Insight
              </h3>
              <p className="text-gray-700">
                An extensive selection of reports to choose from covering all aspects of your clinic, such as patient retention, average Botox usage per patient, or even a patient postcode map.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconCurrencyDollar stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Show Me The Money
              </h3>
              <p className="text-gray-700">
                View your cash, card receipts by supplier, accounts receivables and revenue quickly and easily. How much have your customers prepaid and how long has this cash been held by you?
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white-10 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid mb-10 md:grid-cols-2 gap-4 items-center">
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl text-center md:text-left font-medium mb-7">
                Analytics Drive Growth
              </h2>
              <p className="text-gray-700">
                With Consentz you can quickly get a full picture of how your clinic is performing and then dig deeper into your data to gain more insight. By uncovering trends on, for example, patient retention, cross selling and patient concerns you will be able to grow your clinic faster and more efficiently.
              </p>
              <div className="flex justify-center md:justify-start pt-5">
                <BookDemoButton />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/brbb.png"
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
              <IconTrophy stroke={1.5} className="mb-4" size={36}   />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Key Performance Indicators
              </h3>
              <p className="text-gray-700">
                KPI for a top level subject such as patients, can be further analysed, such as: spend per patient or patients who haven’t visited recently. Action plans can then be put into place to drive better results.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconTarget stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">Comparisons & Targets</h3>
              <p className="text-gray-700">
                Track how well you’re doing by comparing your data against last week, month or year. Motivate yourself and your team by setting goals and targets and track in real time.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconRoute stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">Growth & Efficiency</h3>
              <p className="text-gray-700">
                A 1% gain here and a 1% gain there – soon you’ll see meaningful growth and efficiency. Transform your business with continuous marginal gains.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white-10 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid mb-10 md:grid-cols-2 gap-4 items-center">
            <div className="flex justify-center">
              <img
                src="/directory/images/brbbb.png"
                alt="Healthcare dashboard on laptop"
                className="max-w-full mr-[-30px] mt-4 md:mr-0 md:mt-0"
              />
            </div>
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl text-center md:text-left font-medium mb-7">
                Understand the Numbers
              </h2>
              <p className="text-gray-700">
                Always have fully documented consultations. With Consentz, create pre-populated consultation notes for each treatment saving you from rewriting the same text over and over again.
                When you see information on your clinic do you ever think I don’t understand this, or so what? Too many clinicians understanding the meaning behind the numbers and interpreting them can be daunting. This is where the Consentz Academy reporting and analytics sotfware comes in, giving clear analysis on all graphs, and also providing advice and ideas on what you could do improve your business.
              </p>
              <div className="flex justify-center md:justify-start pt-5">
                <BookDemoButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white-10 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconBook stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4">Clear Explanations</h3>
              <p className="text-gray-700">
                Every graph and data query has it’s own explanation page helping you discover what lies behind the numbers. Each page includes descriptions, trends and possible actions.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconSearch stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Easy to Search
              </h3>
              <p className="text-gray-700">
                The Academy search bar makes searching easy – simply type in the information you are seeking, such as Patient Education, Patient Retention, Reporting and Analytics software and have your query answered.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconSunHigh stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4">
               Advice from the Best
              </h3>
              <p className="text-gray-700">
                With comprehensive advice pages, you have access to knowledge from the clinicians and business consultants who have worked and grown many business in the UK and around the world.
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
