'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Comment fonctionne le coaching sur Edgemy ?",
    answer: "Edgemy vous met en relation avec des coachs poker expérimentés. Après inscription, vous pouvez parcourir les profils des coachs, consulter leurs spécialités et réserver une session. Les sessions se déroulent via Discord dans un salon privé dédié."
  },
  {
    question: "Quels sont les tarifs des sessions de coaching ?",
    answer: "Les tarifs varient selon l'expérience et la spécialité du coach, généralement entre 30€ et 150€ par heure. Chaque coach fixe ses propres tarifs que vous pouvez consulter sur son profil avant de réserver."
  },
  {
    question: "Puis-je annuler ou reporter une session ?",
    answer: "Vous pouvez annuler ou reporter une session jusqu'à 24h avant l'heure prévue sans frais. Les annulations de dernière minute peuvent entraîner des frais selon la politique du coach."
  },
  {
    question: "Quels formats de poker sont couverts ?",
    answer: "Nos coachs couvrent tous les formats populaires : Cash Game (NL2 à NL500+), Tournois (MTT, SNG), Spin & Go, et formats live. Vous pouvez filtrer par spécialité pour trouver le coach parfait."
  },
  {
    question: "Comment se déroule le paiement ?",
    answer: "Les paiements sont sécurisés via Stripe. Vous payez au moment de la réservation, et les fonds ne sont libérés au coach qu'après la session. Remboursement garanti en cas de problème."
  }
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur Edgemy
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5">
                    <div className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Vous avez d&apos;autres questions ?
            </p>
            <a 
              href="mailto:contact@edgemy.fr"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
