namespace MachineSimulator.Backend.Models;

public record ConveyorState(
    int SlotCount,
    Dictionary<int, MoverState> Slots
);
