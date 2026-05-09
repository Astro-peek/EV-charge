import Hero from "../components/Hero/Hero";
import ChargeAnna from "../components/ChargeAnna/ChargeAnna";
import VehicleID from "../components/VehicleID/VehicleID";
import ChargeSaathi from "../components/ChargeSaathi/ChargeSaathi";

const Home = () => {
  return (
    <div className="relative overflow-hidden">

      {/* 🔥 BACKGROUND GLOW EFFECT */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-green-300 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-green-500 opacity-20 blur-3xl rounded-full"></div>

      {/* CONTENT */}
      <div className="relative z-10">

        {/* HERO */}
        <section className="bg-transparent">
          <div className="max-w-7xl mx-auto">
            <Hero />
          </div>
        </section>

        {/* CHARGE ANNA */}
        <section className="bg-white/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto py-5 px-2">
            <ChargeAnna />
          </div>
        </section>

        {/* VEHICLE ID */}
        <section className="bg-gradient-to-r from-green-50 to-white">
          <div className="max-w-7xl mx-auto ">
            <VehicleID />
          </div>
        </section>

        {/* CHARGE SAATHI */}
        <section className="bg-white/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto ">
            <ChargeSaathi />
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;