import axios from "axios";

import type { PipelineFunction } from '../types/pipelineFunction';

const checkSyntax: PipelineFunction = async (email: unknown): Promise<boolean> => {
    console.log('Checking email syntax for:', email);
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const checkDomainMX: PipelineFunction = async (email: unknown): Promise<boolean> => {
    console.log('Checking domain MX for:', email);
    if (typeof email !== 'string') return false;
    const domain = email.split('@')[1];
    return domain === 'gmail.com' || domain === 'outlook.com';
};

const checkDisposable: PipelineFunction = async (email: unknown): Promise<boolean> => {
    console.log('Checking disposable email for:', email);
    if (typeof email !== 'string') return false;
    try {
        const response = await axios.get(`https://catfact.ninja/fact/`);
        return !response?.data?.disposable;
    } catch (error) {
        console.error('Error checking disposable email:', error);
        return false;
    }
};

const checkSpamList: PipelineFunction = async (email: unknown): Promise<boolean> => {
    console.log('Checking spam list for:', email);
    if (typeof email !== 'string') return false;
    try {
        const response = await axios.get(`https://catfact.ninja/fact/`);
        return !response?.data?.onSpamList;
    } catch (error) {
        console.error('Error checking spam list:', error);
        return false;
    }
};

const doNothing: PipelineFunction = async (email: unknown): Promise<boolean> => {
    console.log('Doing nothing with:', email);
    // this function is here to show we are not using all the steps in the pipeline just
    // because they are defined. That is in the yml file which could easily be in a db somewhere.
    return false
};


export default {
    checkSyntax,
    checkDomainMX,
    checkDisposable,
    checkSpamList,
    doNothing
}
