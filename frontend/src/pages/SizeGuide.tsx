import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface SizeData {
  category: string;
  sizes: {
    size: string;
    bust: string;
    waist: string;
    hip: string;
    length: string;
  }[];
}

const sizeGuides: SizeData[] = [
  {
    category: 'Kurta/Tunic',
    sizes: [
      {
        size: 'S',
        bust: '31"',
        waist: '26"',
        hip: '33"',
        length: '28"',
      },
      {
        size: 'M',
        bust: '33"',
        waist: '28"',
        hip: '35"',
        length: '29"',
      },
      {
        size: 'M',
        bust: '36"',
        waist: '30"',
        hip: '38"',
        length: '30"',
      },
      {
        size: 'L',
        bust: '39"',
        waist: '33"',
        hip: '41"',
        length: '31"',
      },
      {
        size: 'XL',
        bust: '42"',
        waist: '36"',
        hip: '44"',
        length: '32"',
      },
      {
        size: 'XXL',
        bust: '45"',
        waist: '39"',
        hip: '47"',
        length: '33"',
      },
    ],
  },
  {
    category: 'Dresses',
    sizes: [
      {
        size: 'S',
        bust: '32"',
        waist: '25"',
        hip: '34"',
        length: '56"',
      },
      {
        size: 'M',
        bust: '34"',
        waist: '27"',
        hip: '36"',
        length: '57"',
      },
      {
        size: 'M',
        bust: '37"',
        waist: '29"',
        hip: '39"',
        length: '58"',
      },
      {
        size: 'L',
        bust: '40"',
        waist: '32"',
        hip: '42"',
        length: '59"',
      },
      {
        size: 'XL',
        bust: '43"',
        waist: '35"',
        hip: '45"',
        length: '60"',
      },
    ],
  },
  {
    category: 'Trousers/Bottoms',
    sizes: [
      {
        size: 'S',
        bust: '26"',
        waist: '24"',
        hip: '32"',
        length: '38"',
      },
      {
        size: 'M',
        bust: '28"',
        waist: '26"',
        hip: '34"',
        length: '39"',
      },
      {
        size: 'M',
        bust: '30"',
        waist: '28"',
        hip: '36"',
        length: '40"',
      },
      {
        size: 'L',
        bust: '32"',
        waist: '30"',
        hip: '38"',
        length: '41"',
      },
      {
        size: 'XL',
        bust: '34"',
        waist: '32"',
        hip: '40"',
        length: '42"',
      },
    ],
  },
];

const SizeGuide = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>

          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-serif mb-6">Size Guide</h1>
            <p className="text-muted-foreground text-lg mb-12">
              Find your perfect fit using our detailed size charts. All measurements are in
              inches. Please measure yourself carefully for the best fit.
            </p>

            {/* Measurement Instructions */}
            <div className="bg-muted/50 rounded-lg p-6 mb-12">
              <h2 className="text-xl font-semibold mb-4">How to Measure</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Bust</p>
                  <p className="text-muted-foreground">
                    Measure across the fullest part of your chest
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Waist</p>
                  <p className="text-muted-foreground">
                    Measure around your natural waistline
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Hip</p>
                  <p className="text-muted-foreground">
                    Measure around the fullest part of your hips
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Length</p>
                  <p className="text-muted-foreground">
                    Measure from shoulder to desired hemline
                  </p>
                </div>
              </div>
            </div>

            {/* Size Charts */}
            <div className="space-y-12">
              {sizeGuides.map((guide, idx) => (
                <div key={idx}>
                  <h2 className="text-2xl font-serif mb-6">{guide.category}</h2>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Size</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Bust</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Waist</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Hip</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guide.sizes.map((size, sizeIdx) => (
                          <tr
                            key={sizeIdx}
                            className="border-t border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium">{size.size}</td>
                            <td className="px-4 py-3">{size.bust}</td>
                            <td className="px-4 py-3">{size.waist}</td>
                            <td className="px-4 py-3">{size.hip}</td>
                            <td className="px-4 py-3">{size.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help Choosing Your Size?</h3>
              <p className="text-blue-800 text-sm">
                If you're between sizes, we recommend choosing the larger size for comfort. For
                unstitched pieces, consult with your tailor using these measurements.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SizeGuide;
