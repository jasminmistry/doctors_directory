import { IconBrain, IconClockHour4, IconMessage, IconClipboardList, IconHeartHandshake, IconFileText, IconStethoscope, IconBrandApplePodcast, IconArrowUpDashed, IconInfoCircle, IconTextCaption, IconActivityHeartbeat, IconDeviceMobilePin } from "@tabler/icons-react";
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
                The Consentz Academy: Learn Clinic Management Software
              </h2>
              <p className="mb-4 text-gray-700">
                One of the biggest benefits of being a Consentz customer is that you have access to all of the learning resources that Consentz produces.The Consentz Academy helps you learn how to master clinic growth and productivity, now that you’re part of the Consentz family.
              </p>

              <div className="max-w-4xl m-auto mt-5 flex flex-col sm:flex-row items-center justify-start  gap-3">
                <a
                  className=" w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
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
                src="/directory/images/seo.png"
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
                Get to Know Your Company with a Brief Business Report
              </h2>
              <p className="text-gray-700">
                The Academy complements the Dashboard, answering any questions you may have. Designed to be your business partner, it’s a resource that fully supports your business ambitions. The Academy is written in a clear, concise and jargon free style, so understanding your data has never been easier.
              </p>
              <div className="flex pt-5">
                <BookDemoButton />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/caa.png"
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
              <IconBrandApplePodcast stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4"> 
                Explanations
              </h3>
              <p className="text-gray-700">
                Have you ever struggled to understand financial information or business jargon, such as recency, reliance or retention rates? The Academy describes in everyday language what these terms (and many more…) mean and why they are relevant for improving your business performance.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconArrowUpDashed stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Next Steps
              </h3>
              <p className="text-gray-700">
                Now you understand your numbers, but perhaps you’re not sure what to do next? The Academy provides clear guidance to help inform your next decision and then measures the impact. Continue or revise, Consentz is always supporting you. 
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconInfoCircle stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Information
              </h3>
              <p className="text-gray-700">
                Industry news on products, equipment launches, techniques and even mergers all feature in the Academy. Fresh information to help stimulate your learning and keep you up to date.
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
                Find Solutions to Problems
              </h2>
              <p className="text-gray-700">
                Solve common issues quickly, with the Academy there to serve you, from how to set up new treatments to sharing photos with patients. Fast access to the information allows you to spend less time on a help line and more time with your patients.
              </p>
              <div className="flex pt-5">
                <BookDemoButton />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/stpb.png"
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
              <IconDeviceMobilePin stroke={1.5} className="mb-4" size={36}   />
              <h3 className="text-xl md:text-lg font-medium mb-4"> 
                Fix It
              </h3>
              <p className="text-gray-700">
                Solve common issues quickly, with the Academy there to serve you, from how to set up new treatments to sharing photos with patients. Fast access to the information allows you to spend less time on a help line and more time with your patients.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconActivityHeartbeat stroke={1.5} className="mb-4" size={36}   />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                New Techniques
              </h3>
              <p className="text-gray-700">
                Think there may be a better way of doing it? Discover time saving techniques, such as using pre-populated notes, or features like Treatment Plans that will give sharp improvements in your clinic’s sales.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconTextCaption stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Definitions
              </h3>
              <p className="text-gray-700">
                Every screen is defined in the Academy – any time you’re not sure what a button does you can find the answerbefore pressing it, giving you peace of mind over the information that is important to you.
              </p>
            </div>
          </div>
        </div>
      </section>

     

    </main>
  );
}
