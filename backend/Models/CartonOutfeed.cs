namespace MachineSimulator.Backend.Models;

public class CartonOutfeed : IMachine
{
    public string Name => "CartonOutfeed";

    private int _itemCount;

    public void AcceptItem(IItem item)
    {
        _itemCount++;
    }

    public void Tick() { }

    public object GetState() => new { ItemsReceived = _itemCount };
}
