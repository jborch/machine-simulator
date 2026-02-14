namespace MachineSimulator.Backend.Models;

public interface IConveyor
{
    int SlotCount { get; }
    IMover? Input { get; set; }
    IMover? Output { get; }
    IMover? TakeOutput();
    void Tick();
    ConveyorState GetState();
}
