/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsRequestShip {
  comment?: string;
  completionDate?: string;
  containers20ftCount?: number;
  containers40ftCount?: number;
  creationDate?: string;
  formationDate?: string;
  loadingTime?: number;
  requestShipID?: number;
  ships?: DsShipInRequest[];
  status?: string;
  /** автозаполнение пользователя в заявках */
  user?: DsUser;
  userID?: number;
}

export interface DsShip {
  capacity?: number;
  containers?: number;
  cranes?: number;
  description?: string;
  draft?: number;
  length?: number;
  name?: string;
  photoURL?: string;
  shipID?: number;
  width?: number;
}

export interface DsShipInRequest {
  requestShipID?: number;
  ship?: DsShip;
  shipID?: number;
  shipsCount?: number;
}

export interface DsUser {
  cargoWeight?: number;
  contacts?: string;
  containers20ftCount?: number;
  containers40ftCount?: number;
  fio?: string;
  login?: string;
  password?: string;
  /** "guest" | "creator" | "port_operator" */
  role?: string;
  userID?: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title No title
 * @contact
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Retrieve a list of requests with optional filters
     *
     * @tags request_ships
     * @name RequestShipList
     * @summary Получить список заявок на расчет времени погрузки
     * @request GET:/api/request_ship
     */
    requestShipList: (
      query?: {
        /** Start date filter */
        start_date?: string;
        /** End date filter */
        end_date?: string;
        /** Status filter */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsRequestShip[], object>({
        path: `/api/request_ship`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve the count of ships in the user's draft request
     *
     * @tags request_ships
     * @name RequestShipBasketList
     * @summary Получить корзину запросов
     * @request GET:/api/request_ship/basket
     */
    requestShipBasketList: (params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/api/request_ship/basket`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve details of a specific request with its ships
     *
     * @tags request_ships
     * @name RequestShipDetail
     * @summary Одна заявка на расчет времени погрузки
     * @request GET:/api/request_ship/{id}
     */
    requestShipDetail: (id: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/api/request_ship/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update fields of an existing request
     *
     * @tags request_ships
     * @name RequestShipUpdate
     * @summary Изменение полей заявки
     * @request PUT:/api/request_ship/{id}
     */
    requestShipUpdate: (
      id: number,
      request: {
        comment?: string;
        containers_20ft_count?: number;
        containers_40ft_count?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/api/request_ship/${id}`,
        method: "PUT",
        secure: true,
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove an entire request from the system
     *
     * @tags request_ships
     * @name RequestShipDelete
     * @summary Удаление всей заявки
     * @request DELETE:/api/request_ship/{id}
     */
    requestShipDelete: (id: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/api/request_ship/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Allow port_operator to complete or reject a formed request
     *
     * @tags request_ships
     * @name RequestShipCompletionCreate
     * @summary Завершить или отклонить заявку (модератор)
     * @request PUT:/api/request_ship/{id}/completion
     */
    requestShipCompletionCreate: (
      id: number,
      data: {
        /** Action (complete or reject) */
        action: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/api/request_ship/${id}/completion`,
        method: "PUT",
        secure: true,
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Finalize a draft request by the creator
     *
     * @tags request_ships
     * @name RequestShipFormationUpdate
     * @summary Сформировать заявку на расчет времени погрузки
     * @request PUT:/api/request_ship/{id}/formation
     */
    requestShipFormationUpdate: (id: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/api/request_ship/${id}/formation`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update the number of ships in a specific request
     *
     * @tags request_ships
     * @name RequestShipShipsUpdate
     * @summary Обновление количества кораблей в заявке
     * @request PUT:/api/request_ship/{id}/ships/{ship_id}
     */
    requestShipShipsUpdate: (
      id: number,
      shipId: number,
      request: {
        ships_count?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/api/request_ship/${id}/ships/${shipId}`,
        method: "PUT",
        secure: true,
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove a ship from a specific request
     *
     * @tags request_ships
     * @name RequestShipShipsDelete
     * @summary Удаление корабля из заявки
     * @request DELETE:/api/request_ship/{id}/ships/{ship_id}
     */
    requestShipShipsDelete: (
      id: number,
      shipId: number,
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/api/request_ship/${id}/ships/${shipId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a list of ships with optional filters
     *
     * @tags ships
     * @name ShipsList
     * @summary Получить список кораблей
     * @request GET:/api/ships
     */
    shipsList: (
      query?: {
        /** Ship name filter */
        name?: string;
        /** Minimum capacity filter */
        capacity?: string;
        /** Active status filter */
        is_active?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/api/ships`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Add a new ship to the system
     *
     * @tags ships
     * @name ShipsCreate
     * @summary Создать корабль
     * @request POST:/api/ships
     */
    shipsCreate: (ship: DsShip, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/api/ships`,
        method: "POST",
        body: ship,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve details of a specific ship by ID
     *
     * @tags ships
     * @name ShipsDetail
     * @summary Один корабль
     * @request GET:/api/ships/{id}
     */
    shipsDetail: (id: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/api/ships/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update details of an existing ship by ID
     *
     * @tags ships
     * @name ShipsUpdate
     * @summary Обновить поля корабля
     * @request PUT:/api/ships/{id}
     */
    shipsUpdate: (id: number, ship: DsShip, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/api/ships/${id}`,
        method: "PUT",
        body: ship,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove a ship from the system by ID
     *
     * @tags ships
     * @name ShipsDelete
     * @summary Удалить корабль
     * @request DELETE:/api/ships/{id}
     */
    shipsDelete: (id: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/api/ships/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description Add a ship to a user's request draft
     *
     * @tags ships
     * @name ShipsAddToShipBucketCreate
     * @summary Добавить корабль в заявку
     * @request POST:/api/ships/{id}/add-to-ship-bucket
     */
    shipsAddToShipBucketCreate: (id: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/api/ships/${id}/add-to-ship-bucket`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Upload an image for a specific ship
     *
     * @tags ships
     * @name ShipsImageCreate
     * @summary Добавить изображение
     * @request POST:/api/ships/{id}/image
     */
    shipsImageCreate: (
      id: number,
      data: {
        /** Image file */
        file: File;
        /** Image file (alternative) */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/api/ships/${id}/image`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Аутентификация и выдача JWT
     *
     * @tags users
     * @name UsersLoginCreate
     * @summary Вход пользователя
     * @request POST:/api/users/login
     */
    usersLoginCreate: (
      credentials: {
        login?: string;
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/users/login`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаление JWT и сессии
     *
     * @tags users
     * @name UsersLogoutCreate
     * @summary Выход пользователя
     * @request POST:/api/users/logout
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, string>, any>({
        path: `/api/users/logout`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Получение данных профиля авторизованного пользователя
     *
     * @tags users
     * @name UsersProfileList
     * @summary Профиль пользователя
     * @request GET:/api/users/profile
     * @secure
     */
    usersProfileList: (params: RequestParams = {}) =>
      this.request<DsUser, Record<string, string>>({
        path: `/api/users/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные авторизованного пользователя
     *
     * @tags users
     * @name UsersProfileUpdate
     * @summary Обновление профиля пользователя
     * @request PUT:/api/users/profile
     * @secure
     */
    usersProfileUpdate: (user: DsUser, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/api/users/profile`,
        method: "PUT",
        body: user,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Создаёт нового пользователя
     *
     * @tags users
     * @name UsersRegisterCreate
     * @summary Регистрация пользователя
     * @request POST:/api/users/register
     */
    usersRegisterCreate: (user: DsUser, params: RequestParams = {}) =>
      this.request<DsUser, Record<string, string>>({
        path: `/api/users/register`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
