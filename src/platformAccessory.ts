import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { TrinnovHomebridgePlatform } from './platform';

export class TrinnovPlatformAccessory {

  private readonly service: Service;

  private exampleStates = {
    Power: true,
    Volume: 100,
    Mute: false,
    Input: 'HDMI 1',
    On: true,
    Brightness: 100,
  };

  constructor(
    private readonly platform: TrinnovHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    platform.log.debug('Initializing ', accessory.context.device.name);

    // set accessory information
    // TODO: Auto Discover Model and (if possible and allowed) Serial Number
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Trinnov')
      .setCharacteristic(this.platform.Characteristic.Model, 'Altitude')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    this.service = this.accessory.getService(this.platform.Service.Television) ||
      this.accessory.addService(this.platform.Service.Television);

    this.createTVService();
    this.createTVSpeakerService();
    this.createLightBulbService();
    this.createMotionSensorServices();

    // if (this.externalAccessories.length > 0) {
    //   this.api.publishExternalAccessories(PLUGIN_NAME, this.externalAccessories);
    // }

  }

  createTVService() {
    // Set Television Service Name & Discovery Mode
    this.service
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, this.accessory.context.device.displayName)
      .setCharacteristic(
        this.platform.Characteristic.SleepDiscoveryMode,
        this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE,
      );

    // Power State Get/Set
    this.service
      .getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setPowerState.bind(this))
      .onGet(this.getPowerState.bind(this));

    // Input Source Get/Set
    this.service
      .getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
      .onSet(this.setInputState.bind(this))
      .onGet(this.getInputState.bind(this));

    // Remote Key Set
    // this.service.getCharacteristic(this.platform.Characteristic.RemoteKey).onSet(this.setRemoteKey.bind(this));
  }

  createTVSpeakerService() {

    const speakerService = this.accessory.getService(this.platform.Service.TelevisionSpeaker) ||
    this.accessory.addService(new this.platform.Service.TelevisionSpeaker(this.accessory.context.device.name));

    speakerService.getCharacteristic(this.platform.Characteristic.Mute)
      .onSet(this.setMute.bind(this))
      .onSet(this.getMute.bind(this));

    speakerService.getCharacteristic(this.platform.Characteristic.Volume)
      .onSet(this.setVolume.bind(this))
      .onGet(this.getVolume.bind(this));

  }

  // TODO: Demo Code, to be removed.
  createLightBulbService() {

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    const lightBulbService = this.accessory.getService(this.platform.Service.Lightbulb);

    if (lightBulbService) {
      this.accessory.removeService(lightBulbService);
    }
  }

  // TODO: Demo Code, to be removed.
  createMotionSensorServices() {

    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    // Example: add two "motion sensor" services to the accessory
    const motionSensorOneService = this.accessory.getService('Motion Sensor One Name') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor One Name', 'YourUniqueIdentifier-1');

    const motionSensorTwoService = this.accessory.getService('Motion Sensor Two Name') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor Two Name', 'YourUniqueIdentifier-2');

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     */
    let motionDetected = false;
    setInterval(() => {
      // EXAMPLE - inverse the trigger
      motionDetected = !motionDetected;

      // push the new value to HomeKit
      motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected);
      motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, !motionDetected);

      this.platform.log.debug('Triggering motionSensorOneService:', motionDetected);
      this.platform.log.debug('Triggering motionSensorTwoService:', !motionDetected);
    }, 10000);
  }

  async setPowerState(value: CharacteristicValue) {
    this.exampleStates.Power = value as boolean;
    this.platform.log.debug('Set Characteristic Power ->', value);
  }

  async getPowerState(): Promise<CharacteristicValue> {
    const isPower = this.exampleStates.Power;
    this.platform.log.debug('Get Characteristic Power ->', isPower);
    return isPower;
  }

  async setInputState(value: CharacteristicValue) {
    this.exampleStates.Input = value as string;
    this.platform.log.debug('Set Characteristic Input ->', value);
  }

  async getInputState(): Promise<CharacteristicValue> {
    const input = this.exampleStates.Input;
    this.platform.log.debug('Get Characteristic Input ->', input);
    return input;
  }

  async setMute(value: CharacteristicValue) {
    this.exampleStates.Mute = value as boolean;
    this.platform.log.debug('Set Characteristic Mute ->', value);
  }

  async getMute(): Promise<CharacteristicValue> {
    const isMute = this.exampleStates.Mute;
    this.platform.log.debug('Get Characteristic Mute ->', isMute);
    return isMute;
  }

  async setVolume(value: CharacteristicValue) {
    this.exampleStates.Volume = value as number;
    this.platform.log.debug('Set Characteristic Volume ->', value);
  }

  async getVolume(): Promise<CharacteristicValue> {
    const volume = this.exampleStates.Volume;
    this.platform.log.debug('Get Characteristic Volume ->', volume);
    return volume;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.exampleStates.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isOn = this.exampleStates.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setBrightness(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.exampleStates.Brightness = value as number;

    this.platform.log.debug('Set Characteristic Brightness -> ', value);
  }

}
