@if ($paginator->hasPages())
  @if ($paginator->onFirstPage())
    <span>‹ Önceki</span>
  @else
    <a href="{{ $paginator->previousPageUrl() }}" rel="prev">‹ Önceki</a>
  @endif

  <span>{{ $paginator->currentPage() }} / {{ $paginator->lastPage() }}</span>

  @if ($paginator->hasMorePages())
    <a href="{{ $paginator->nextPageUrl() }}" rel="next">Sonraki ›</a>
  @else
    <span>Sonraki ›</span>
  @endif
@endif
