import { getCurrentLogger } from './logger';
import Q from 'q';
import winston from 'winston';
import { authenticatedRequest } from './kards-request';
import { Session } from './session';
import { Endpoints } from './types';
import _ from 'underscore';

const logger: winston.Logger = getCurrentLogger('includes-endpoints');

var endpoints: Endpoints | undefined = undefined;

function refreshAuthEndpoints(session: Session): Promise<Endpoints> {
    logger.silly('refreshAuthEndpoints');
    const deferred = Q.defer();
    authenticatedRequest('GET', '/', session).then((result) => {
        if (typeof result == 'object' && _.has(result, 'endpoints')) {
            endpoints = result.endpoints;
            deferred.resolve(endpoints);
        } else {
            deferred.reject(new Error('Unknown return result'));
        }
    }).catch((e) => {
        deferred.reject(e);
    });
    return <Promise<Endpoints>><any>deferred.promise;
}

export default function getAllEndpoints(session: Session): Promise<Endpoints> {
    logger.silly('getAllEndpoints');
    const deferred = Q.defer();
    if (endpoints != undefined && endpoints.hasOwnProperty('my_client') && endpoints.my_client != null && endpoints.my_client != '') {
        logger.silly('endpoints exists');
        return new Promise((resolve, reject) => {
           if (endpoints != undefined)
                return resolve(endpoints);
            return reject(new Error('Session invalidated after check'))
        });
    } else {
        refreshAuthEndpoints(session).then((returnedEndpoints) => {
            if (returnedEndpoints == undefined) {
                if (endpoints != undefined && endpoints.hasOwnProperty('my_client') && endpoints.my_client != null && endpoints.my_client != '') {
                    return deferred.resolve(endpoints);
                }
            } else if (returnedEndpoints.hasOwnProperty('my_client') && returnedEndpoints.my_client != null && returnedEndpoints.my_client != '') {
                return deferred.resolve(returnedEndpoints);
            }
            return deferred.reject(new Error('No endpoints found'));
        }).catch((e) => {
            return deferred.reject(e);
        });
    }
    return <Promise<Endpoints>><any>deferred.promise;
}