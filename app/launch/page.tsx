import HeroSection from "./components/hero-section"
import WhatItIs from "./components/what-it-is"
import HowItWorks from "./components/how-it-works"
import ProgramDetails from "./components/program-details"
import WhoIsItFor from "./components/who-is-it-for"
import CallToAction from "./components/call-to-action"

export default function LaunchPage() {
    return (
        <>
            <HeroSection/>
            <WhatItIs/>
            <HowItWorks/>
            <ProgramDetails/>
            <WhoIsItFor/>
            <CallToAction/>
        </>
    )
}
