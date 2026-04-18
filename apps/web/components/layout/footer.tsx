export default function Footer() {
    return <footer className="flex flex-col items-center justify-center w-full h-32 border-t mt-12">
        <a
            className="flex items-center justify-center"
            href="https://muwpay.com"
            target="_blank"
            rel="noopener noreferrer"
        >
            Powered by{' '}
            <img src="/muwpayLogoIcon.svg" alt="muwpay Logo" className="h-4 ml-2" />
        </a>
        <div className="flex justify-center mt-4 space-x-3">
            <a
                href="https://v1.muwp.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-48 text-center"
            >
                Single Token
            </a>
            <span className="text-gray-300">|</span>
            <a
                href="mailto:contact@muwpay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-48 text-center"
            >
                Support
            </a>
            <span className="text-gray-300">|</span>
            <a
                href="https://www.muwp.xyz/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-48 text-center"
            >
                Docs
            </a>
        </div>
    </footer>
}