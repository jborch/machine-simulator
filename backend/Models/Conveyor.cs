namespace MachineSimulator.Backend.Models;

public class Conveyor : IMachine
{
    private readonly IMover?[] _slots;

    public string Name { get; }
    public int SlotCount => _slots.Length;

    public IMover? Input
    {
        get => _slots[0];
        set => _slots[0] = value;
    }

    public IMover? Output => _slots[SlotCount - 1];

    public Conveyor(string name, int slotCount)
    {
        Name = name;
        _slots = new IMover?[slotCount];
    }

    public IMover? TakeOutput()
    {
        var mover = _slots[SlotCount - 1];
        _slots[SlotCount - 1] = null;
        return mover;
    }

    public void PlaceAt(int slot, IMover mover)
    {
        if (_slots[slot] != null)
            throw new InvalidOperationException($"Slot {slot} is already occupied.");
        _slots[slot] = mover;
    }

    public void Reset()
    {
        Array.Clear(_slots);
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

    public object GetState() => new ConveyorState(
        SlotCount,
        _slots.Select((s, i) => (s, i))
              .Where(x => x.s != null)
              .ToDictionary(x => x.i, x => x.s!.GetState())
    );
}
