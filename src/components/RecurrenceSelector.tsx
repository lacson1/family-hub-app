import { useState } from 'react';
import { Repeat, X } from 'lucide-react';

export interface RecurrenceRule {
    frequency: 'daily' | 'weekly' | 'monthly' | 'never';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

interface RecurrenceSelectorProps {
    value?: RecurrenceRule | null;
    onChange: (rule: RecurrenceRule | null) => void;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({ value, onChange }) => {
    const [isExpanded, setIsExpanded] = useState(!!value && value.frequency !== 'never');
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'never'>(
        value?.frequency || 'never'
    );
    const [interval, setInterval] = useState(value?.interval || 1);
    const [endDate, setEndDate] = useState(value?.endDate || '');
    const [selectedDays, setSelectedDays] = useState<number[]>(value?.daysOfWeek || []);

    const days = [
        { value: 0, label: 'Sun' },
        { value: 1, label: 'Mon' },
        { value: 2, label: 'Tue' },
        { value: 3, label: 'Wed' },
        { value: 4, label: 'Thu' },
        { value: 5, label: 'Fri' },
        { value: 6, label: 'Sat' }
    ];

    const handleFrequencyChange = (newFrequency: 'daily' | 'weekly' | 'monthly' | 'never') => {
        setFrequency(newFrequency);

        if (newFrequency === 'never') {
            setIsExpanded(false);
            onChange(null);
        } else {
            setIsExpanded(true);
            updateRule(newFrequency, interval, endDate, selectedDays);
        }
    };

    const handleIntervalChange = (newInterval: number) => {
        setInterval(newInterval);
        updateRule(frequency, newInterval, endDate, selectedDays);
    };

    const handleEndDateChange = (newEndDate: string) => {
        setEndDate(newEndDate);
        updateRule(frequency, interval, newEndDate, selectedDays);
    };

    const toggleDay = (day: number) => {
        const newDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day].sort((a, b) => a - b);

        setSelectedDays(newDays);
        updateRule(frequency, interval, endDate, newDays);
    };

    const updateRule = (
        freq: 'daily' | 'weekly' | 'monthly' | 'never',
        intv: number,
        end: string,
        days: number[]
    ) => {
        if (freq === 'never') {
            onChange(null);
            return;
        }

        const rule: RecurrenceRule = {
            frequency: freq,
            interval: intv,
            endDate: end || undefined,
            daysOfWeek: freq === 'weekly' && days.length > 0 ? days : undefined
        };

        onChange(rule);
    };

    const getFrequencyLabel = () => {
        if (frequency === 'never') return 'Does not repeat';
        if (interval === 1) {
            switch (frequency) {
                case 'daily': return 'Daily';
                case 'weekly': return 'Weekly';
                case 'monthly': return 'Monthly';
            }
        }
        return `Every ${interval} ${frequency === 'daily' ? 'days' : frequency === 'weekly' ? 'weeks' : 'months'}`;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="flex items-center text-sm font-medium text-gray-700">
                    <Repeat className="w-4 h-4 mr-2" />
                    Repeats
                </label>
                {isExpanded && frequency !== 'never' && (
                    <button
                        type="button"
                        onClick={() => handleFrequencyChange('never')}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                    </button>
                )}
            </div>

            {/* Frequency Selector */}
            <select
                value={frequency}
                onChange={(e) => handleFrequencyChange(e.target.value as 'never' | 'daily' | 'weekly' | 'monthly')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Recurrence frequency"
                title="Recurrence frequency"
            >
                <option value="never">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>

            {/* Expanded Options */}
            {isExpanded && frequency !== 'never' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {/* Interval */}
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">
                            Repeat every
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={interval}
                                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                                className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                aria-label="Repeat interval"
                                title="Repeat interval"
                            />
                            <span className="text-sm text-gray-600">
                                {frequency === 'daily' ? 'day(s)' : frequency === 'weekly' ? 'week(s)' : 'month(s)'}
                            </span>
                        </div>
                    </div>

                    {/* Days of Week (for weekly) */}
                    {frequency === 'weekly' && (
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">
                                Repeat on
                            </label>
                            <div className="flex space-x-1">
                                {days.map((day) => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleDay(day.value)}
                                        className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg transition-colors ${selectedDays.includes(day.value)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* End Date */}
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">
                            End date (optional)
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            min={new Date().toISOString().split('T')[0]}
                            aria-label="Recurrence end date"
                            title="Recurrence end date"
                        />
                        {endDate && (
                            <p className="text-xs text-gray-500 mt-1">
                                Repeats until {new Date(endDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700 font-medium">
                            {getFrequencyLabel()}
                            {frequency === 'weekly' && selectedDays.length > 0 && (
                                <span className="text-gray-500 font-normal">
                                    {' '}on {selectedDays.map(d => days[d].label).join(', ')}
                                </span>
                            )}
                            {endDate && (
                                <span className="text-gray-500 font-normal">
                                    {' '}until {new Date(endDate).toLocaleDateString()}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecurrenceSelector;

