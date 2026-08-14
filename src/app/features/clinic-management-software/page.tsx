import { b2bBookDemoHref } from "@/lib/b2b-hub/seo";
import { IconBrain, IconClipboard, IconClipboardPlus, IconClock, IconFileText, IconHeartHandshake, IconMapPin, IconMessage, IconStethoscope } from "@tabler/icons-react";

export default function ClinicManagementSoftwarePage() {
    const bookDemoHref = b2bBookDemoHref();
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
                        Clinic Management Software For Your Practice
                    </h2>
                    <p className="mb-4 text-gray-700">There are lots of tools out there to book appointments, control stock, raise invoices and manage patient records, but are they elegant and easy to use? Consentz enables you to transform your clinic management process with a system that you and your reception staff will love.</p>

                    <div className="max-w-4xl m-auto mt-5 flex flex-col sm:flex-row items-center justify-start  gap-3">
                        <a className=" w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors" href="/directory/account/login/">Join as a patient — it's free</a>

                        <a className="inline-flex h-auto w-full md:w-auto items-center justify-center gap-2 rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors" href="/directory/register/clinic/">List your practice</a>
                       
                    </div>

                    </div>
                    <div className="flex justify-end">
                    <img
                        src="/directory/images/cm.png"
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
                Easy calendar scheduling To Manage Your Clinicians
              </h2>
              <p className="text-gray-700">With the Consentz calendar system you can create a new appointment for a new patient in the about the same time it takes for an afternoon yawn. Consentz allows for easy viewing of all the clinicians, rooms, and equipment. The full functionality of the calendar is available via the iPad or desktop, whilst staff or outside support can use the diary anywhere.</p>  
              <div className="flex justify-center md:justify-start pt-5">
                <a
                    href={bookDemoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg px-6 py-3  bg-black text-base font-medium text-white hover:bg-neutral-800 transition-colors capitalize hover:cursor-pointer"
                >
                    BOOK DEMO
                </a>
            </div>          
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/ecs.png"
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
                <IconStethoscope stroke={1.5} className="mb-4" size={36} />
                <h3 className="text-xl md:text-lg font-medium mb-4">Clinicians</h3>
                <p className="text-gray-700">Show when clinicians are available or unavailable. See weeks and months ahead, and overbook if you need to.</p>
              </div>

              <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
                <IconMapPin stroke={1.5} className="mb-4" size={36} />
                <h3 className="text-xl md:text-lg font-medium mb-4">Locations & Equipment</h3>
                <p className="text-gray-700">Easily see what rooms and equipment are free and which aren't. Ensure a patient requiring multiple rooms or equipment has an enjoyable experience.</p>
              </div>

              <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
                <IconClipboardPlus stroke={1.5} className="mb-4" size={36} />
                <h3 className="text-xl md:text-lg font-medium mb-4">Change Appointment</h3>
                <p className="text-gray-700">Manage all aspects of an appointment from the information window, where changing an appointment is very easy, without having to type.</p>
              </div>

            </div>

        </div>
      </section>

    </main>
  );
}