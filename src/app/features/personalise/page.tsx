import { IconBrain, IconClockHour4, IconMessage, IconClipboardList, IconHeartHandshake, IconFileText, IconStethoscope, IconInfoCircle, IconNotebook, IconFile, IconUserEdit, IconPolaroid, IconReportMedical, IconDatabase, IconHourglassEmpty } from "@tabler/icons-react";
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
                Personalized Clinic Software for Effective Branding
              </h2>
              <p className="mb-4 text-gray-700">
                You are in the medical aesthetics industry, where looking professional is just as important as being professional. With Consentz’s clinic branding and personalisation features, you have all the tools you’ll need to tailor the Consentz clinic software platform and be seen precisely as you want to be seen.
              </p>

              <div className="max-w-4xl m-auto mt-5 flex flex-col sm:flex-row items-center justify-start  gap-3">
                <a
                  className=" w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white text-center hover:bg-neutral-800 transition-colors"
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
                src="/directory/images/persb.png"
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
                Clinic Branding
              </h2>
              <p className="text-gray-700">
                The Consentz experience allows you to customise your colours, images and profiles, creating the best impression of your clinic for your patients.
              </p>
              <div className="flex justify-center md:justify-start pt-5">
                <BookDemoButton />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/seo.png"
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
              <IconPolaroid stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4"> Image & Logo</h3>
              <p className="text-gray-700">
                Upload your company logo and personalise your background images to make your patients instantly feel they are being looked after by the best.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconUserEdit stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Your Profiles
              </h3>
              <p className="text-gray-700">
                Make your patients feel at home with a welcome message from your clinic on their landing page, before educating them further about their clinician’s background
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconFile stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Patient Application
              </h3>
              <p className="text-gray-700">
                Tailor the Patient App with your branding, so the patient keeps you in mind whenever they’re thinking of cosmetic medicine.
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
                src="/directory/images/cb.png"
                alt="Healthcare dashboard on laptop"
                className="max-w-full mr-[-30px] mt-4 md:mr-0 md:mt-0"
              />
            </div>
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl text-center md:text-left font-medium mb-7">
               Control
              </h2>
              <p className="text-gray-700">
                Change access levels, patient PIN numbers, build questionnaires, select reports, manage stock batch numbers – Consentz gives you complete control of the experience you want your patients and staff to enjoy.
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
              <IconStethoscope stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Treatment
              </h3>
              <p className="text-gray-700">
                Create your own treatment lists tailored to your clinic, manage default durations for simplier booking, and create time saving notes.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconNotebook stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Pre-Set Notes
              </h3>
              <p className="text-gray-700">
                Upload your medical records, price lists and consent forms to Consentz so they are always available and easily accessible.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconInfoCircle stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Questionnaire Builder
              </h3>
              <p className="text-gray-700">
                Build questionnaires of your choosing and upload for the patient to complete. These are fast to prepare and include the ability to ask multiple choice; scale 1 to 10; or simple Yes/No questions.
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
              Libraries
            </h2>
            <p className="text-center m-auto text-gray-700 mb-8 max-w-3xl">You don’t have to waste any more time searching for the appropriate literature to hand out to patients. Consentz comes with a library of
videos and brochures for your use and a large number of medical consent forms for your approval and use.</p>

            <div className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3">

              <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
                <div className="flex mb-4 items-center justify-center w-[80px] h-[80px] rounded-full bg-gray-200">
                  <IconReportMedical stroke={1.5} size={36} />
                </div>
                <h3 className="text-xl md:text-lg font-medium mb-4">Patient Management Software</h3>
                <p className="text-gray-700">Patient management software is a digital tool that simplifies and organizes clinic operations. Whether managing patient records, scheduling appointments, or automating billing, software takes the manual work out.</p>
              </div>

              <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
                <div className="flex mb-4 items-center justify-center w-[80px] h-[80px] rounded-full bg-gray-200">
                  <IconHourglassEmpty stroke={1.5} size={36} />
                </div>
                <h3 className="text-xl md:text-lg font-medium mb-4">Waiting List</h3>
                <p>Build a waiting list of patients eager to see a particular clinician. Notify patients on the list as soon as an appointment is available with appointment reminder software. So the next time you get a cancellation – fill it without telephoning around.</p>
              </div>

              <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
                <div className="flex mb-4 items-center justify-center w-[80px] h-[80px] rounded-full bg-gray-200">
                  <IconDatabase stroke={1.5} size={36} />
                </div>
                <h3 className="text-xl md:text-lg font-medium mb-4">Memory Jog</h3>
                <p>Relying on your memory is not always best. Make non- medical notes about any patient issues or interests enabling richer and better informed conversations to occur.</p>
              </div>

            </div>
          </div>
      </section>

    </main>
  );
}
