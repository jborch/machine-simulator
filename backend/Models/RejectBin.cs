namespace MachineSimulator.Backend.Models;

public class RejectBin : IMachine
{
    public string Name => "RejectBin";

    private int _itemCount;

    public void AcceptItem(IItem item)
    {
        _itemCount++;
    }

    public void Reset() => _itemCount = 0;

    public void Tick() { }

    public object GetState() => new { ItemsRejected = _itemCount };
}
