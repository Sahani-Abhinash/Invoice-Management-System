import { Injectable } from '@angular/core';

export interface TableState<T> {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  displayData: T[];
  allData: T[];
  filteredData: T[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  searchText: string;
}

@Injectable()
export class TableDataManagerService<T> {
  private tableState: TableState<T> = {
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    displayData: [],
    allData: [],
    filteredData: [],
    sortColumn: '',
    sortDirection: 'asc',
    searchText: ''
  };

  Math = Math;

  constructor() { }

  // Set all data
  setData(data: T[]): void {
    this.tableState.allData = [...data];
    this.tableState.filteredData = [...data];
    this.tableState.totalRecords = data.length;
    this.tableState.currentPage = 1;
    this.updateDisplay();
  }

  // Apply search filter with custom filter function
  applySearch(searchText: string, filterFn: (item: T, searchText: string) => boolean): void {
    this.tableState.searchText = searchText;
    const searchLower = searchText.toLowerCase().trim();
    
    if (!searchLower) {
      this.tableState.filteredData = [...this.tableState.allData];
    } else {
      this.tableState.filteredData = this.tableState.allData.filter(item => 
        filterFn(item, searchLower)
      );
    }

    this.tableState.totalRecords = this.tableState.filteredData.length;
    this.tableState.currentPage = 1;
    this.applySorting();
    this.updateDisplay();
  }

  // Sort data with custom sort function
  sortBy(column: string, compareFn: (a: T, b: T, column: string) => number): void {
    if (this.tableState.sortColumn === column) {
      this.tableState.sortDirection = this.tableState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.tableState.sortColumn = column;
      this.tableState.sortDirection = 'asc';
    }

    this.applySorting(compareFn);
    this.updateDisplay();
  }

  // Apply sorting
  private applySorting(compareFn?: (a: T, b: T, column: string) => number): void {
    if (!this.tableState.sortColumn || !compareFn) return;

    this.tableState.filteredData.sort((a, b) => {
      const comparison = compareFn(a, b, this.tableState.sortColumn);
      return this.tableState.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Change page size
  setPageSize(size: number): void {
    this.tableState.pageSize = size;
    this.tableState.currentPage = 1;
    this.updateDisplay();
  }

  // Go to page
  goToPage(page: number): void {
    const maxPages = this.getTotalPages();
    if (page >= 1 && page <= maxPages) {
      this.tableState.currentPage = page;
      this.updateDisplay();
    }
  }

  // Get pagination info
  getTotalPages(): number {
    return Math.ceil(this.tableState.totalRecords / this.tableState.pageSize);
  }

  getPaginationNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.tableState.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Update display data for current page
  private updateDisplay(): void {
    const startIndex = (this.tableState.currentPage - 1) * this.tableState.pageSize;
    const endIndex = startIndex + this.tableState.pageSize;
    this.tableState.displayData = this.tableState.filteredData.slice(startIndex, endIndex);
  }

  // Get current state
  getState(): TableState<T> {
    return { ...this.tableState };
  }

  // Get display data
  getDisplayData(): T[] {
    return this.tableState.displayData;
  }

  // Get state properties
  getCurrentPage(): number {
    return this.tableState.currentPage;
  }

  getPageSize(): number {
    return this.tableState.pageSize;
  }

  getTotalRecords(): number {
    return this.tableState.totalRecords;
  }

  getSortColumn(): string {
    return this.tableState.sortColumn;
  }

  getSortDirection(): 'asc' | 'desc' {
    return this.tableState.sortDirection;
  }

  getSearchText(): string {
    return this.tableState.searchText;
  }
}
