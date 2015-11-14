/// <reference path="chrome.d.ts" />
/// <reference path="jquery.d.ts" />


module Utils {

	/**
	 * Abstracts storage and retrieval of settings. Settings are saved to chromes extension storage, so will be
	 * available across all pages the extension is used on.
	 */
	export class SettingsManager {


		private static _instance:SettingsManager;

		public settings:any;

		constructor() {
			if(SettingsManager._instance){
				throw new Error("Error: Instantiation failed: Use SettingsManager.getInstance() instead of new.");
			}
			SettingsManager._instance = this;
		}

		public static getInstance():SettingsManager {
			if(!SettingsManager._instance) {
				SettingsManager._instance = new SettingsManager();
			}
			return SettingsManager._instance;
		}


		/**
		 * Retrieves stored settings.
		 * @param callback Function to call once settings have been loaded.
		 */
		public loadSettings(callback:()=>{}):any {
			return chrome.storage.local.get((data:Object) => {
				this.settings = data;

				if (!this.settings ||  jQuery.isEmptyObject(this.settings)) {
					this.save()
				}
				callback();
			});
		}

		/**
		 * Save all configured settings to chromes extension storage.
		 */
		private save():void {
			chrome.storage.local.set(this.settings);
		}


		/**
		 * Retrieve listed property to storage.
		 * @param property Name of settings to retrieve.
		 * @returns {any} Value of setting.
		 */
		public getGlobalSetting(property:string):string {
			return this.settings[property];
		}


		/**
		 * Store setting.
		 * @param property Name to store setting under.
		 * @param value Value of setting.
		 */
		public setGlobalSetting(property:string, value:any):void {
			this.settings[property] = value;
			this.save();
		}

	}
}