import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Help() {
  const faqs = [
    {
      question: "How do I transfer money between accounts?",
      answer: "To transfer money between accounts, navigate to the dashboard and click on 'Transfer' under quick actions. Select the source account, destination account, enter the amount, and provide a description. Review the details and confirm the transfer."
    },
    {
      question: "How do I view my transaction history?",
      answer: "You can view your transaction history by clicking on 'Transactions' in the side navigation menu. From there, you can filter your transactions by account, type, and search for specific transactions."
    },
    {
      question: "How do I update my personal information?",
      answer: "To update your personal information, navigate to 'Settings' in the side navigation menu. You can modify your profile details, including name, email, phone number, and address. Don't forget to save your changes."
    },
    {
      question: "Is my data secure?",
      answer: "We take security seriously. Your data is encrypted and protected using industry-standard protocols. We recommend using a strong, unique password and enabling two-factor authentication for an extra layer of security."
    },
    {
      question: "What should I do if I forget my password?",
      answer: "If you forget your password, click on the 'Forgot password?' link on the login page. You will receive an email with instructions to reset your password. If you don't receive the email, check your spam folder or contact our support team."
    },
    {
      question: "How do I report suspicious activity on my account?",
      answer: "If you notice any suspicious activity on your account, contact our support team immediately by phone or email. We recommend changing your password right away and reviewing your recent transactions."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-neutral-900">
            Help & Support
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Frequently asked questions and support resources.
          </p>
        </div>

        <div className="border-t border-neutral-200 px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm font-medium text-neutral-800">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-neutral-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-8">
            <h4 className="text-base font-medium text-neutral-800">Contact Support</h4>
            <p className="mt-2 text-sm text-neutral-600">
              If you couldn't find an answer to your question, please contact our support team.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-neutral-50 p-4 rounded-md">
                <h5 className="text-sm font-medium text-neutral-800 mb-1">Email Support</h5>
                <p className="text-sm text-neutral-600">support@securebank.example</p>
                <p className="text-xs text-neutral-500 mt-1">Response within 24 hours</p>
              </div>

              <div className="bg-neutral-50 p-4 rounded-md">
                <h5 className="text-sm font-medium text-neutral-800 mb-1">Phone Support</h5>
                <p className="text-sm text-neutral-600">+1 (800) 123-4567</p>
                <p className="text-xs text-neutral-500 mt-1">Mon-Fri: 9am-5pm EST</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
