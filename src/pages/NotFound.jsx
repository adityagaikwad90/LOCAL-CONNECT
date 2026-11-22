import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound = () => <main className="page-shell flex min-h-[75vh] items-center px-5 pt-28">
  <div className="mx-auto max-w-xl text-center">
    <p className="eyebrow justify-center">Wrong turn</p>
    <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">This place isn’t on our map.</h1>
    <p className="mt-4 text-lg text-white/55">That page may have moved. Head back to the city guide and keep exploring.</p>
    <Link to="/explore" className="button-primary mx-auto mt-7"><Compass size={17} />Explore destinations</Link>
  </div>
</main>;

export default NotFound;
