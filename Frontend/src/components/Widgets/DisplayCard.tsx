export default function DisplayCard(title: string, data: string){
    return (
        <div className="w-full max-w-md rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
            <ul className="divide-y divide-gray-100 dark:divide-zinc-800 h-full">
                <li className="flex items-center justify-between py-2 gap-5 h-full">
                    <span className="font-medium h-full">
                        {title}
                    </span>
                    <span className="text-s text-gray-400">
                        {data}
                    </span>
                </li>
            </ul>
        </div>
    )
}