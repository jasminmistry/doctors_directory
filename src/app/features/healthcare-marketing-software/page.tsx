import { b2bBookDemoHref } from "@/lib/b2b-hub/seo";
import { IconBrain, IconClockHour4, IconMessage, IconClipboardList, IconHeartHandshake, IconFileText, IconStethoscope, IconLayoutCollage, IconEaseInOutControlPoints, IconStar } from "@tabler/icons-react";
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
                Grow Your Clinic with All-in-one Marketing Software
              </h2>
              <p className="mb-4 text-gray-700">
                You’ve sunk a huge amount of money and time building your aesthetic marketing campaigns, Facebook Ads, Google PPC – all to generate new leads for your clinic. But then what? Does your lead find exactly what they are looking for amongst the sea of information on your website? Do they call but no one is available to answer? Your prospect’s enthusiasm and momentum is easily lost. But how do you act quickly 24/7? With Consentz Medical Marketing Tools you can keep that enquiry momentum going, right through to an appointment booking.. Often without you having to lift a finger!
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
                src="/directory/images/mbb.png"
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
                Create Beautiful Emails
              </h2>
              <p className="text-gray-700">
                Create beautiful, informative emails to convert prospects and retain your existing patients. The simple to use drag and drop interface can get you up and running in minutes. Add your branding, expand the knowledge shared with your clients and add actionable links to contact forms or telephone numbers. It’s easy to present yourself and your business.
              </p>
              <div className="flex justify-center md:justify-start pt-5">
                <BookDemoButton />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/ecsb.png"
                alt="Healthcare dashboard on laptop"
                className="max-w-full mr-[-30px] mt-4 md:mr-0 md:mt-0"
              />
            </div>
            
          </div>
        </div>
      </section>

       <section className="bg-white-10 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid mb-10 md:grid-cols-2 gap-4 items-center">
            <div className="flex justify-center">
              <img
                src="/directory/images/cmb.png"
                alt="Healthcare dashboard on laptop"
                className="max-w-full mr-[-30px] mt-4 md:mr-0 md:mt-0"
              />
            </div>
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl text-center md:text-left font-medium mb-7">
                Automate Campaigns
              </h2>
              <p className="text-gray-700">
                How often is a lead received and not followed up at all? Maybe one or two emails are sent? Or a telephone message is left, but then the prospect is forgotten…Build a fully automated medical and aesthetic marketing campaigns and schedule actions of sending emails/SMS over days and weeks. Your prospect never forgets you and when they’re ready to book they do it with you and not a competitor. Your patients can recieve an information rich campaign on new treatments over weeks. With a varierty of triggers, such as a new interest, you can leave active campaigns runnning in the background, so once set you won’t even have to lift a finger. 
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
          <div className="grid mb-10 md:grid-cols-2 gap-4 items-center">
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl text-center md:text-left font-medium mb-7">
                Manage your Prospects
              </h2>
              <p className="text-gray-700">
                With Consentz marketing tools you’ll be able to see at a glance your current list of enquiries and their stage of engagement, easily assign a follow up to a memeber of staff, drag and drop enquiries as they move through stages to a sale and send emails & SMS from a single panel. Converting prospects has never been easier.
              </p>
              <div className="flex justify-center md:justify-start pt-5">
                <BookDemoButton />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/ebb.png"
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
              <IconEaseInOutControlPoints stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4"> 
                Pipeline
              </h3>
              <p className="text-gray-700">
                As with the bespoke aspects of Consentz, you can set up your own stages in the sales pipeline to work your prospect list through. The simple drag and drop interface allows you to understand exactly where a prospect is in the cycle, and a simple click bring you all the information you need to convert them.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconStar stroke={1.5} className="mb-4" size={36}   />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Gather Reviews
              </h3>
              <p className="text-gray-700">
                With Consentz’s Checkout window on the Calendar page you can quickly and easily send post appointment review links to your patients. They’ll recieve a text message with a link to your review page – increasing your social proof and SEO rankings. You can also create and send postappointment surveys to gather rating and reviews for use on your website and in other marketing materials.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconLayoutCollage stroke={1.5} className="mb-4" size={36}  />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Segmentation
              </h3>
              <p className="text-gray-700">
                Want to send marketing material to all your patients over 65? Build lists based on certain criteria to segment and focus your email and SMS campaigns to an exact demographic of your patient or prospect list to target your messaging and increase your conversion and retention rates.
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
