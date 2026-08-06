import { IconBrain, IconClockHour4, IconMessage, IconClipboardList, IconHeartHandshake, IconFileText, IconStethoscope, IconNotebook, IconPolaroid, IconWritingSign, IconTrash, IconBook, IconShare3, IconCalendar, IconCalendarTime, IconChartBarPopular, IconCone, IconUserCheck } from "@tabler/icons-react";
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
                Photos & Records Made Simple with Patient Record Software
              </h2>
              <p className="mb-4 text-gray-700">
                Spending more time on administration than treating patients? Say
                goodbye to time consuming record keeping, while still having
                good medical record system. Consentz brings together the patient
                record software needed for your photos and records – photography
                capture, editing, retrieval, consultation note taking and
                consent forms – into one clean process your clinicians will
                love.
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
                src="/directory/images/ceb.png"
                alt="Healthcare dashboard on laptop"
                className="max-w-full mr-[-30px] mt-4 md:mr-0 md:mt-0"
              />
            </div>
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl text-center md:text-left font-medium mb-7">
                The Perfect Photography Toolset For Aesthetics
              </h2>
              <p className="text-gray-700">
                Tedious photo taking and management is redundant. Consentz comes
                with an intuitive and comprehensive photography feature set that
                you and your patients will love.
              </p>
              <div className="flex pt-5">
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
              <IconWritingSign stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">Drawing</h3>
              <p className="text-gray-700">
                Tools range from changing colours, font sizes and shading whole
                areas quickly, to recording and altering the quantities
                administered.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconChartBarPopular stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Comparisons
              </h3>
              <p className="text-gray-700">
                Have you ever struggled for accurate before and after
                photographs? Consentz's ghosting feature allows you to precisely
                line up photographs so you get the very best comparisons.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconPolaroid stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Photo Management
              </h3>
              <p className="text-gray-700">
                Photographs can easily be selected from a carousel of all the
                patient's images, which are time and date tagged for easy
                identification. A privacy feature can also be used to hide
                intimate photographs if required.
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
                Plan for Future Treatments
              </h2>
              <p className="text-gray-700">
                Educate, advise and patient record all in the one place. The
                electronic patient records software allows you to have a
                structured and documented consultation, whether you’re feeling
                fresh or tired at the end of a long day.
              </p>
              <div className="flex pt-5">
                <BookDemoButton />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/bba.png"
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
              <IconCalendarTime stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Scheduling
              </h3>
              <p className="text-gray-700">
                Set up the schedule of treatments and intervals between
                treatments.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconCalendar stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">Calendar</h3>
              <p className="text-gray-700">
                The Treatment Plan can the seen by the receptionist to make the
                necessary appointments.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconShare3 stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">Share</h3>
              <p className="text-gray-700">
                Share completed Treatment Plans with a patient, either sending
                them a copy via email or directly to their mobile.
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
                src="/directory/images/cfb.png"
                alt="Healthcare dashboard on laptop"
                className="max-w-full mr-[-30px] mt-4 md:mr-0 md:mt-0"
              />
            </div>
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl md:text-2xl text-center md:text-left font-medium mb-7">
                Consent Forms
              </h2>
              <p className="text-gray-700">
                Informed consent is essential to all cosmetic medical
                treatments. Consentz makes this process both rigorous,
                comprehensive and easy to document. So you can spend the time
                discussing and informing the patient rather than chasing around
                for forms and pens. The signed consent forms can then be shared
                directly with the patient for total clarity.
              </p>
              <div className="flex pt-5">
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
              <IconBook stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">Library</h3>
              <p className="text-gray-700">
                Never have to find or print a consent form again. Ensure you
                always have full and informed consent. A library of consent
                forms is available for you to select, edit and approve.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconCone stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Highlight & Initial
              </h3>
              <p className="text-gray-700">
                Have you ever struggled for accurate before and after
                photographs? Consentz’s ghosting feature allows you to precisely
                line up photographs so you get the very best comparisons.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconUserCheck stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Always Signed
              </h3>
              <p className="text-gray-700">
                Photographs can easily be selected from a carousel of all the
                patient’s images, which are time and date tagged for easy
                identification. A privacy feature can also be used to hide
                intimate photographs if required.
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
                Complete Photos and Records In Less Time
              </h2>
              <p className="text-gray-700">
                Always have fully documented consultations. With Consentz,
                create pre-populated consultation notes for each treatment
                saving you from rewriting the same text over and over again.
              </p>
              <div className="flex pt-5">
                <BookDemoButton />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/directory/images/bob.png"
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
              <IconNotebook stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Pre-Set Notes
              </h3>
              <p className="text-gray-700">
                Pre-set all of your recurring consultation notes to avoid
                missing key critical elements in your consultation and ensure
                your records are always complete.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconWritingSign stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                Easy to Compile & Edit
              </h3>
              <p className="text-gray-700">
                If you are pressed for time and end up making a medical record
                for a consultation over the course of a day simply keep editing
                the record. There is no need to make numerous records that
                relate to a single appointment.
              </p>
            </div>

            <div className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md">
              <IconTrash stroke={1.5} className="mb-4" size={36} />
              <h3 className="text-xl md:text-lg font-medium mb-4">
                No Deletion
              </h3>
              <p className="text-gray-700">
                To fully protect clinicians against any legal accusations of
                tampering of medical records it is not possible to delete a
                medical record once archived. All notes can be edited
                indefinitely until archived.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
