import Steps from './sections/Features/Steps';
import Hero from './sections/Hero/Hero';
import Meaning from './sections/Features/Meaning';
import BankServices from './sections/Features/BankServices';

const DonationPage = () => {
  return (
    <main className="pt-16">
      <Hero />
      <Meaning />
      <BankServices />
      <Steps />
    </main>
  );
};
export default DonationPage;
