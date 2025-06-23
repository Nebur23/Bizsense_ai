import {
  BarChart3,
  Package,
  Users,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Play,
  Globe,
  Smartphone,
  HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

const features = [
  {
    icon: BarChart3,
    title: "Finance & Accounting",
    description:
      "Complete financial management with automated bookkeeping, invoicing, and tax compliance for Cameroon regulations.",
    benefits: [
      "Automated VAT calculations",
      "OHADA compliance",
      "Multi-currency support (XAF/EUR/USD)",
    ],
  },
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Track stock levels, manage suppliers, and optimize your warehouse operations across multiple locations.",
    benefits: [
      "Real-time stock tracking",
      "Supplier management",
      "Automated reorder alerts",
    ],
  },
  {
    icon: Users,
    title: "Customer Management",
    description:
      "Build stronger relationships with your customers through comprehensive CRM and sales tracking.",
    benefits: ["Customer database", "Sales pipeline", "Communication history"],
  },
  {
    icon: TrendingUp,
    title: "Business Analytics",
    description:
      "Make data-driven decisions with powerful reporting and business intelligence tools.",
    benefits: ["Custom dashboards", "Financial reports", "Performance metrics"],
  },
];

const testimonials = [
  {
    name: "Marie Ngozi",
    company: "Ngozi Trading Ltd",
    location: "Douala",
    content:
      "BizSense AI has transformed how we manage our import business. The inventory tracking and financial reporting have saved us countless hours.",
    rating: 5,
  },
  {
    name: "Jean-Paul Mbarga",
    company: "Mbarga Construction",
    location: "Yaoundé",
    content:
      "Finally, an ERP system that understands Cameroonian business needs. The OHADA compliance features are exactly what we needed.",
    rating: 5,
  },
  {
    name: "Fatima Hassan",
    company: "Hassan Textiles",
    location: "Garoua",
    content:
      "The multi-currency support and automated invoicing have streamlined our operations significantly. Highly recommended!",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 25000,
    period: "month",
    description: "Perfect for small businesses just getting started",
    features: [
      "Up to 2 users",
      "Basic inventory management",
      "Simple accounting",
      "Email support",
      "Mobile app access",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: 45000,
    period: "month",
    description: "Ideal for growing SMEs with advanced needs",
    features: [
      "Up to 10 users",
      "Advanced inventory & accounting",
      "Customer management",
      "Business analytics",
      "Priority support",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solutions for larger organizations",
    features: [
      "Unlimited users",
      "All features included",
      "Custom integrations",
      "Dedicated support",
      "On-premise deployment",
      "Training & onboarding",
    ],
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}

      {/* Hero Section */}
      <section className='bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div>
              <Badge className='mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100'>
                🇨🇲 Made for Cameroon SMEs
              </Badge>
              <h1 className='text-4xl lg:text-6xl font-bold text-gray-900 mb-6'>
                Grow Your Business with
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600'>
                  {" "}
                  Smart ERP
                </span>
              </h1>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                The complete business management solution designed specifically
                for Cameroonian SMEs. Manage inventory, finances, and customers
                all in one powerful platform.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 mb-8'>
                <Button size='lg' className='bg-blue-600 hover:bg-blue-700'>
                  Start Free 30-Day Trial
                  <ArrowRight className='ml-2 w-5 h-5' />
                </Button>
                <Button size='lg' variant='outline' className='group'>
                  <Play className='mr-2 w-5 h-5 group-hover:scale-110 transition-transform' />
                  Watch Demo
                </Button>
              </div>
              <div className='flex items-center gap-6 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-500' />
                  No setup fees
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-500' />
                  Cancel anytime
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-500' />
                  24/7 support
                </div>
              </div>
            </div>
            <div className='relative'>
              <div className='bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='font-semibold text-gray-900'>
                      Dashboard Overview
                    </h3>
                    <Badge className='bg-green-100 text-green-800'>Live</Badge>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <div className='text-2xl font-bold text-blue-600'>
                        2.4M FCFA
                      </div>
                      <div className='text-sm text-gray-600'>
                        Monthly Revenue
                      </div>
                    </div>
                    <div className='bg-green-50 p-4 rounded-lg'>
                      <div className='text-2xl font-bold text-green-600'>
                        1,247
                      </div>
                      <div className='text-sm text-gray-600'>
                        Items in Stock
                      </div>
                    </div>
                  </div>
                  <div className='h-32 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center'>
                    <BarChart3 className='w-16 h-16 text-blue-500' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
              Everything Your Business Needs
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Streamline your operations with our comprehensive suite of
              business management tools, tailored for the Cameroonian market.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {features.map((feature, index) => (
              <Card
                key={index}
                className='group hover:shadow-lg transition-all duration-300 border-0 shadow-md'
              >
                <CardHeader>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors'>
                    <feature.icon className='w-6 h-6 text-blue-600' />
                  </div>
                  <CardTitle className='text-xl'>{feature.title}</CardTitle>
                  <CardDescription className='text-gray-600'>
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2'>
                    {feature.benefits.map((benefit, idx) => (
                      <li
                        key={idx}
                        className='flex items-center gap-2 text-sm text-gray-600'
                      >
                        <CheckCircle className='w-4 h-4 text-green-500 flex-shrink-0' />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
                Built for Cameroonian Businesses
              </h2>
              <p className='text-lg text-gray-600 mb-8'>
                We understand the unique challenges facing SMEs in Cameroon. Our
                ERP system is designed to address these specific needs with
                local compliance and support.
              </p>
              <div className='space-y-6'>
                <div className='flex gap-4'>
                  <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Globe className='w-4 h-4 text-green-600' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      OHADA Compliance
                    </h3>
                    <p className='text-gray-600'>
                      Fully compliant with OHADA accounting standards and
                      Cameroonian tax regulations.
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <Smartphone className='w-4 h-4 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      Mobile-First Design
                    </h3>
                    <p className='text-gray-600'>
                      Access your business data anywhere with our responsive
                      mobile application.
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0'>
                    <HeadphonesIcon className='w-4 h-4 text-purple-600' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      Local Support
                    </h3>
                    <p className='text-gray-600'>
                      Get help in French or English from our Cameroon-based
                      support team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='relative'>
              <div className='bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 text-white'>
                <h3 className='text-2xl font-bold mb-6'>
                  Why Choose BizSense AI?
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <Clock className='w-5 h-5' />
                    <span>Save 10+ hours per week on admin tasks</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <TrendingUp className='w-5 h-5' />
                    <span>Increase revenue by up to 25%</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Shield className='w-5 h-5' />
                    <span>Bank-level security for your data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id='testimonials' className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
              Trusted by 500+ Cameroonian Businesses
            </h2>
            <p className='text-xl text-gray-600'>
              See what our customers have to say about their experience with
              BizSense AI
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className='border-0 shadow-lg'>
                <CardContent className='p-6'>
                  <div className='flex mb-4'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className='w-5 h-5 text-yellow-400 fill-current'
                      />
                    ))}
                  </div>
                  <p className='text-gray-600 mb-6 italic'>
                    {testimonial.content}
                  </p>
                  <div>
                    <div className='font-semibold text-gray-900'>
                      {testimonial.name}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {testimonial.company}
                    </div>
                    <div className='text-sm text-blue-600'>
                      {testimonial.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id='pricing' className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
              Simple, Transparent Pricing
            </h2>
            <p className='text-xl text-gray-600'>
              Choose the plan that fits your business size and needs.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? "border-2 border-blue-500 shadow-xl" : "border shadow-lg"}`}
              >
                {plan.popular && (
                  <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                    <Badge className='bg-blue-500 text-white px-4 py-1'>
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className='text-center pb-8'>
                  <CardTitle className='text-2xl'>{plan.name}</CardTitle>
                  <div className='mt-4'>
                    <span className='text-4xl font-bold'>
                      {isNaN(Number(plan.price))
                        ? plan.price
                        : formatCurrency(Number(plan.price))}
                    </span>
                    {plan.period && (
                      <span className='text-gray-600'>/{plan.period}</span>
                    )}
                  </div>
                  <CardDescription className='mt-2'>
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-3 mb-8'>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className='flex items-center gap-3'>
                        <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0' />
                        <span className='text-gray-600'>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.price === "Custom"
                      ? "Contact Sales"
                      : "Start Free Trial"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-blue-600 to-cyan-600'>
        <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl lg:text-4xl font-bold text-white mb-6'>
            Ready to Transform Your Business?
          </h2>
          <p className='text-xl text-blue-100 mb-8'>
            Join hundreds of Cameroonian SMEs already using BizSense AI to grow
            their business. Start your free trial today - no credit card
            required.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              size='lg'
              className='bg-white text-blue-600 hover:bg-gray-100'
            >
              Start Free 30-Day Trial
              <ArrowRight className='ml-2 w-5 h-5' />
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='border-white text-white hover:bg-white hover:text-blue-600'
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id='contact' className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>
                Get in Touch
              </h2>
              <p className='text-lg text-gray-600 mb-8'>
                Have questions? Our team is here to help you find the right
                solution for your business.
              </p>

              <div className='space-y-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <Phone className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <div className='font-semibold text-gray-900'>Phone</div>
                    <div className='text-gray-600'>+237 6XX XXX XXX</div>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <Mail className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <div className='font-semibold text-gray-900'>Email</div>
                    <div className='text-gray-600'>contact@bizsense.cm</div>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <MapPin className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <div className='font-semibold text-gray-900'>Office</div>
                    <div className='text-gray-600'>Douala, Cameroon</div>
                  </div>
                </div>
              </div>
            </div>

            <Card className='shadow-lg border-0'>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  We&apos;ll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <Input placeholder='First name' />
                    <Input placeholder='Last name' />
                  </div>
                  <Input placeholder='Email address' type='email' />
                  <Input placeholder='Company name' />
                  <Textarea
                    placeholder='Tell us about your business needs...'
                    rows={4}
                  />
                  <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
