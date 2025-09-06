import Steps from './components/fourthsection';
import Hero from './components/herosection';
import Meaning from './components/secondsection';
import BankServices from './components/thirdsection';

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
