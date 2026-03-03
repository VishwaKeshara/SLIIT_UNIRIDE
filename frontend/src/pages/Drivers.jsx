import React from "react";
import { FaPhoneAlt, FaRoute, FaIdBadge } from "react-icons/fa";

function Drivers() {
  const driverList = [
    {
      name: "Nimal Perera",
      route: "Malabe - Kaduwela",
      shift: "Morning Shift",
      phone: "+94 77 123 4567",
      busNo: "UR-12",
    },
    {
      name: "Kasun Silva",
      route: "Malabe - Battaramulla",
      shift: "Day Shift",
      phone: "+94 71 234 5678",
      busNo: "UR-07",
    },
    {
      name: "Chamara Fernando",
      route: "Malabe - Nugegoda",
      shift: "Evening Shift",
      phone: "+94 76 345 6789",
      busNo: "UR-19",
    },
    {
      name: "Saman Jayasinghe",
      route: "Malabe - Maharagama",
      shift: "Morning Shift",
      phone: "+94 70 456 7891",
      busNo: "UR-05",
    },
  ];

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-3xl bg-white p-8 shadow-md md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-700">Drivers</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Meet Our Shuttle Team</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            All UniRide drivers are trained, verified, and assigned to fixed routes to ensure a reliable daily commute.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {driverList.map((driver) => (
            <article key={driver.name} className="rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-900">
                {driver.name.split(" ").map((part) => part[0]).join("")}
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{driver.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{driver.shift}</p>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <FaRoute className="text-yellow-500" />
                  {driver.route}
                </p>
                <p className="flex items-center gap-2">
                  <FaIdBadge className="text-yellow-500" />
                  Bus: {driver.busNo}
                </p>
                <p className="flex items-center gap-2">
                  <FaPhoneAlt className="text-yellow-500" />
                  {driver.phone}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Drivers;
