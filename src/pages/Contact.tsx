import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const contactSchema = z.object({
  studentName: z.string().trim().min(1, 'Student name is required').max(100),
  parentName: z.string().trim().min(1, 'Parent name is required').max(100),
  classGrade: z.string().min(1, 'Please select a class'),
  phone: z.string().trim().min(10, 'Valid phone number required').max(15),
  message: z.string().trim().max(500).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    studentName: '',
    parentName: '',
    classGrade: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    
    // Open email with form data
    const subject = encodeURIComponent(`Admission Enquiry - ${formData.studentName}`);
    const body = encodeURIComponent(
      `Student Name: ${formData.studentName}\nParent Name: ${formData.parentName}\nClass: ${formData.classGrade}\nPhone: ${formData.phone}\nMessage: ${formData.message || 'N/A'}`
    );
    window.open(`mailto:karthikananthoju71@gmail.com?subject=${subject}&body=${body}`);
    
    setIsSubmitted(true);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I am interested in admission enquiry for Brilliant Tutorials.\n\nStudent: ${formData.studentName || '[Name]'}\nClass: ${formData.classGrade || '[Class]'}\nPhone: ${formData.phone || '[Phone]'}`
    );
    window.open(`https://wa.me/919398224736?text=${message}`, '_blank');
  };

  const classOptions = [
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Olympiad', 'IIT Foundation'
  ];

  if (isSubmitted) {
    return (
      <div className="animate-fade-in section-padding">
        <div className="container-custom max-w-xl text-center">
          <div className="bg-card p-8 rounded-2xl card-elevated">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">{t('contact.success')}</h2>
            <p className="text-muted-foreground mb-6">We will contact you at {formData.phone} shortly.</p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-primary"
            >
              Send Another Enquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-muted-foreground">We're here to help you with admission enquiries</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-card p-6 md:p-8 rounded-2xl card-elevated">
              <h2 className="text-2xl font-bold mb-6">Send an Enquiry</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.student')} *</label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter student name"
                  />
                  {errors.studentName && <p className="text-destructive text-sm mt-1">{errors.studentName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.parent')} *</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter parent name"
                  />
                  {errors.parentName && <p className="text-destructive text-sm mt-1">{errors.parentName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.class')} *</label>
                  <select
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select class</option>
                    {classOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.classGrade && <p className="text-destructive text-sm mt-1">{errors.classGrade}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.phone')} *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.message')}</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Any specific questions or concerns?"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    {t('contact.form.submit')}
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('contact.whatsapp')}
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Info & Map */}
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl card-elevated">
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <a href="tel:9398224736" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <span>9398224736</span>
                  </a>
                  <a href="mailto:karthikananthoju71@gmail.com" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <span>karthikananthoju71@gmail.com</span>
                  </a>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl card-elevated">
                <h3 className="text-xl font-semibold mb-4">{t('contact.address')}</h3>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-muted-foreground">
                    MN Reddy Nagar, Near Hanuman Temple,<br />
                    Chintal, Suchitra, Quthbullapur,<br />
                    Hyderabad, Telangana – 500067
                  </p>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.0!2d78.4!3d17.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDMwJzAwLjAiTiA3OMKwMjQnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Brilliant Tutorials Location"
                  />
                </div>
                <a
                  href="https://maps.app.goo.gl/mWbjUNuJiaqAQn4P6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline mt-4"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
