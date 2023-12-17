export default function Footer() {
    return <footer className="flex flex-col items-center justify-center w-full h-24 border-t mt-12">
        <a
            className="flex items-center justify-center"
            href="https://muwpay.com"
            target="_blank"
            rel="noopener noreferrer"
        >
            Powered by{' '}
            <img src="/muwpayLogoIcon.svg" alt="muwpay Logo" className="h-4 ml-2" />
        </a>
        <p className="text-xs mt-4">Prototype made by{' '}
            <a
                href="https://arguiot.com"
                target="_blank"
                rel="noopener noreferrer"
            >
                Arthur Guiot
            </a>
        </p>
    </footer>
}