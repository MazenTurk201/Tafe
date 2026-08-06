import ThemeImage from '../Utilties/ThemeImage';

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '../animate-ui/components/radix/accordion';

function ListItem(Title: string, Link: string) {
    return <li>
        <a target='_blank' href={Link} rel="noreferrer" className="hover:text-purple-400 transition-colors">🔗 {Title}</a>
    </li>
}

function Footer() {
    return <footer className='w-full flex not-sm:flex-col items-center justify-center gap-5 p-10 bg-zinc-50 dark:bg-black text-zinc-800 dark:text-zinc-200'>
        <div className='flex flex-col items-center justify-center text-left gap-3'>
            {/* <img 
                src={theme === 'dark' ? '/images/logoDark.png' : '/images/logo.png'} 
             alt="Turk Logo" className="w-20 h-20" /> */}
            <ThemeImage size={250}/>
            <p>Thanks for visiting my portfolio! {"<3`"}</p>
            <p>&copy; {new Date().getFullYear()} Mazen Sameh. All rights reserved.</p>
        </div>
        <div className='w-90'>
            <p>Products:</p>
            <ul>
                {ListItem("Love Choice", "https://mazenturk201.github.io/Love-Choice")}
                {ListItem("Turk Translate", "https://github.com/MazenTurk201/Turk-Translate/releases/latest")}
                {ListItem("Easy-Command", "https://github.com/MazenTurk201/Easy-Command/releases/latest")}
                <li>
                    Let's build something amazing together!
                </li>
            </ul>
        </div>
        <div className='md:w-1/5 w-full flex flex-col items-center justify-center gap-2'>
            <Accordion type="single" collapsible className='w-full'>
                <AccordionItem value={'1'}>
                    <AccordionTrigger>How to contact?</AccordionTrigger>
                    <AccordionContent className='flex flex-col items-start justify-start gap-2'>
                        <div>Contact me via <a target='_blank' className='text-green-500' href="https://wa.me/201092130013?text=Hello+Turk">Whatsapp</a></div>
                        <div>Contact me via <a target='_blank' className='text-red-500' href="mailto:maznktr@gmail.com">Email</a></div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value={'2'}>
                    <AccordionTrigger>What services do I offer?</AccordionTrigger>
                    <AccordionContent className='flex flex-col items-start justify-start gap-2'>
                        <div className='flex flex-col items-start justify-start gap-2'>
                            I specialize in IT Engineering
                            <ul className='list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 flex flex-col items-start justify-start gap-1'>
                                <li>CCTV Installation & Maintenance</li>
                                <li>Mobile App Development</li>
                                <li>Python Development</li>
                                <li>Web Development</li>
                                <li>Network Configuration</li>
                                <li>And more!</li>
                            </ul>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value={'3'}>
                    <AccordionTrigger>Are you available for freelance?</AccordionTrigger>
                    <AccordionContent>
                        Yes, I am open to freelance opportunities. Feel free to reach out to discuss your project and how I can help bring it to life!
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    </footer>
};

export default Footer;