var { Log, Service, Characteristic, Command, ExecutionState, Generic } = require('./Generic');

class HeaterCooler extends Generic {
    constructor (device, config) {
        super(device, config);

        this.service = new Service.HeaterCooler(device.getName());
        this.currentState = this.service.getCharacteristic(Characteristic.CurrentHeaterCoolerState);
        this.targetState = this.service.getCharacteristic(Characteristic.TargetHeaterCoolerState);
        this.targetState.on('set', this.setStatus.bind(this));

        this.services.push(this.service);
    }

    /**
	* Triggered when Homekit try to modify the Characteristic.TargetHeaterCoolerState
	**/
    setStatus(value, callback) {
        var commands = null;
       
        commands = new Command('setAirDemandMode');
        this.executeCommand(commands, function(status, error, data) {
            switch (status) {
                case ExecutionState.INITIALIZED: callback(error); break;
                case ExecutionState.IN_PROGRESS: break;
                case ExecutionState.COMPLETED: break;
                case ExecutionState.FAILED:
                    this.targetState.updateValue(this.currentState.value);
                break;
                default: break;
            }
        }.bind(this));
    }

    onStateUpdate(name, value) {
        var currentState = null, targetState = null;

        switch(name) {
            case 'io:VentilationConfigurationModeState':
                currentState = Characteristic.CurrentHeaterCoolerState.INACTIVE;
            break;
        }
        
        if(this.currentState != null && currentState != null)
            this.currentState.updateValue(currentState);
        if(!this.isCommandInProgress() && this.targetState != null && targetState != null)
            this.targetState.updateValue(targetState);
    }
}

module.exports = HeaterCooler