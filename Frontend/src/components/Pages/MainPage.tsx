import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { useTheme } from '../Utilties/changeMode';

// 1. Define the Unit structure for TypeScript type safety
interface Unit {
    id: number;
    name: string;
    // Add additional fields here if your API provides them (e.g., description?: string)
}

export default function Main() {
    const { t, i18n } = useTranslation();

    // 2. Define states for your units data, loading status, and errors
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Sync body text direction with language changes
    useEffect(() => {
        document.body.dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
    }, [i18n.language]);

    // 3. Fetch Units data from backend API on component mount
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await fetch('http://localhost:5069/api/Units');
                
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                
                const data: Unit[] = await response.json();
                setUnits(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchUnits();
    }, []);

    return (
        <main className="flex flex-1 w-full flex-col items-center py-22 md:pt-32 px-16 bg-white dark:bg-black not-sm:p-5 gap-5 text-black dark:text-white">
            
            <h1 className='relative bottom-10 left-5 text-xl'>{t('welcome')}</h1>

            {/* 4. Conditional UI Rendering for data fetch states */}
            <div className="w-full max-w-md p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold mb-4">{t('units_list', 'Units')}</h2>

                {loading && (
                    <p className="text-gray-500 animate-pulse">{t('loading', 'Loading units...')}</p>
                )}

                {error && (
                    <p className="text-red-500 font-semibold">{t('error', 'Error:')} {error}</p>
                )}

                {!loading && !error && units.length === 0 && (
                    <p className="text-gray-400">{t('no_units', 'No units available.')}</p>
                )}

                {!loading && !error && units.length > 0 && (
                    <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {units.map((unit) => (
                            <li key={unit.id} className="py-2 flex justify-between items-center">
                                <span className="font-medium">{unit.name}</span>
                                <span className="text-xs text-gray-400">ID: {unit.id}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </main>
    );
}
