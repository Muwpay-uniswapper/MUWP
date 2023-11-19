export default function Navbar() {
    return (
        <div className="text-white my-auto py-4 items-center sticky top-0 z-50 bg-transparent">
            <div className="container max-w-screen-xl flex justify-between">
                <a href="/">
                    <div className="flex items-center gap-x-2 cursor-pointer">
                        <img src="/muwpayLogoIcon.svg" alt="logo" />
                        <p>BETA</p>
                    </div>
                </a>
                <div className="flex gap-6">
                    <div className="flex gap-6 items-center">
                        <a className="" href="/bot">
                            <button disabled className="uppercase py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false !cursor-default">
                                BOT
                            </button>
                        </a>
                        <a className="" href="/transactions">
                            <button className="uppercase cursor-pointer py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false false">
                                transactions
                            </button>
                        </a>
                        <a className="" href="/networks">
                            <button disabled className="uppercase py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false !cursor-default">
                                Networks
                            </button>
                        </a>
                        <a className="" href="/blockchain">
                            <button disabled className="uppercase py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false !cursor-default">
                                Blockchain
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}