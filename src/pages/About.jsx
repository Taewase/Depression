import React from 'react';
import { Brain, Heart, Users, Shield, Clock, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">About MindCare</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Empowering mental wellness through accessible, confidential screening and support
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              At MindCare, we believe that mental health is just as important as physical health. 
              Our mission is to break down barriers to mental health support by providing 
              accessible, confidential screening tools and connecting individuals with the 
              resources they need.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We're committed to destigmatizing mental health conversations and making 
              professional-grade screening tools available to everyone, regardless of 
              location or financial situation.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 flex items-center justify-center">
            <div className="w-48 h-48 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Brain className="h-20 w-20 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Values</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Compassion</h4>
              <p className="text-gray-700 leading-relaxed">
                We approach mental health with empathy and understanding, creating a safe space for everyone.
              </p>
            </div>
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Privacy</h4>
              <p className="text-gray-700 leading-relaxed">
                Your data belongs to you. We use industry-leading security to protect your information.
              </p>
            </div>
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Evidence-Based</h4>
              <p className="text-gray-700 leading-relaxed">
                Our tools are built on clinically validated methods used by healthcare professionals.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Ready to Start Your Journey?</h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Take the first step towards better mental wellness today.
          </p>
          <button className="px-10 py-5 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            Begin Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;