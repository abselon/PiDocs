declare module 'react-native-calendar-picker' {
    import { Component } from 'react';
    import { StyleProp, TextStyle, ViewStyle } from 'react-native';
    import { Moment } from 'moment';

    export interface CalendarPickerProps {
        width?: number;
        height?: number;
        startFromMonday?: boolean;
        allowRangeSelection?: boolean;
        minDate?: Date | string;
        maxDate?: Date | string;
        selectedStartDate?: Date;
        selectedEndDate?: Date;
        textStyle?: StyleProp<TextStyle>;
        selectedDayColor?: string;
        selectedDayTextColor?: string;
        todayBackgroundColor?: string;
        todayTextStyle?: StyleProp<TextStyle>;
        previousTitle?: string;
        nextTitle?: string;
        previousTitleStyle?: StyleProp<TextStyle>;
        nextTitleStyle?: StyleProp<TextStyle>;
        monthTitleStyle?: StyleProp<TextStyle>;
        yearTitleStyle?: StyleProp<TextStyle>;
        onDateChange?: (date: Moment | null, type?: string) => void;
        dayShape?: 'circle' | 'square';
    }

    export default class CalendarPicker extends Component<CalendarPickerProps> { }
} 