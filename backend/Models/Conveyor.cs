namespace MachineSimulator.Backend.Models;

public class Conveyor : IConveyor
{
    private readonly IMover?[] _slots;

    public int SlotCount => _slots.Length;

    public IMover? Input
    {
        get => _slots[0];
        set => _slots[0] = value;
    }

    public IMover? Output => _slots[SlotCount - 1];

    public IMover? TakeOutput()
    {
        var mover = _slots[SlotCount - 1];
        _slots[SlotCount - 1] = null;
        return mover;
    }

    public Conveyor(int slotCount)
    {
        _slots = new IMover?[slotCount];
    }

    public void PlaceAt(int slot, IMover mover)
    {
        if (_slots[slot] != null)
            throw new InvalidOperationException($"Slot {slot} is already occupied.");
        _slots[slot] = mover;
    }

    public void Tick()
    {
        for (int i = SlotCount - 1; i > 0; i--)
        {
            if (_slots[i] == null && _slots[i - 1] != null)
            {
                _slots[i] = _slots[i - 1];
                _slots[i - 1] = null;
            }
        }
    }

    public ConveyorState GetState() => new(_slots.Select(s => s?.GetState()).ToArray());
}
