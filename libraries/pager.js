/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
	All rights reserved.
*/
class Pager {
    constructor(options) {
        this.max = options.max || 1;
        this.useBTR = options.useBTR;
        this.currentPage = 1;

        let pager
        if (this.useBTR) {
            pager = document.createElement('div')
            pager.setAttribute('class', 'btr-pager-holder')
            pager.innerHTML = `
                <ul class="pager">
                    <li class="pager-prev"><a><span class="icon-left"></span></a></li>
                    <li class="pager-mid">
                        Page <input class="pager-cur" type="text value"> of <span class="pager-total"></span>
                    </li>
                    <li class="pager-next"><a><span class="icon-right"></span></a></li>
                </ul>
            `
        } else {
            pager = document.createElement('div')
            pager.setAttribute('class', 'pager-holder')
            pager.setAttribute('style', 'width: 100%; text-align: center; box-sizing: border-box; display: inline-block;')
            pager.innerHTML = `
                <ul class="pager" style="box-sizing: inherit;display: inline-block;margin: 0;width: auto;">
                    <li class="pager-prev"><a><span class="icon-left"></span></a></li>
                    <li class="pager-mid" style="padding-right: 8px;">
                        Page <input class="pager-cur form-control input-field" type="text value" style="width: auto;text-align: center; display: initial;"> of <span class="pager-total"></span>
                    </li>
                    <li class="pager-next"><a><span class="icon-right"></span></a></li>
                </ul>
            `
        }

        this.pager = pager;
        this.field = pager.getElementsByClassName("pager-cur")[0];
        this.prev = pager.getElementsByClassName("pager-prev")[0];
        this.next = pager.getElementsByClassName("pager-next")[0];
        this.cur = pager.getElementsByClassName("pager-cur")[0];

        this.prev.firstChild.addEventListener("click", () => {
            this.prevPage()
        })

        this.next.firstChild.addEventListener("click", () => {
            this.nextPage()
        })

        this.cur.addEventListener("keydown", (e) => {
            if (e.keyCode === 13 && this.onset) {
                let page = parseInt(this.cur.value, 10)
                if (isNaN(page)) return;
                page = Math.max(1, Math.min(this.max, page))
                if (this.currentPage != page) {
                    this.setPage(page)
                }
            }
        })

        this.field.value = 1
        this.toggle(this.prev, false)
        this.toggle(this.next, true)

        this.pager.getElementsByClassName("pager-total")[0].textContent = this.max
        
        this.pagerToggle();
    }

    pagerToggle() {
        if (this.collection && (this.collection.length < this.perPage) || !this.collection) {
            this.pager.style.display = "none";
        } else {
            this.pager.style.display = this.useBTR ? "inherit" : "inline-block";
        }
    }

    setPage(newPage) {
        if (newPage == this.currentPage) return;
        this.currentPage = newPage

        this.field.value = newPage
        this.toggle(this.prev, newPage > 1)
        this.toggle(this.next, newPage < this.max)

        if (this.onset) this.onset(newPage);
        this.pagerToggle();
    }

    toggle(obj, bool) {
        obj.classList.toggle("disabled", !bool)
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.setPage(this.currentPage - 1)
        }
    }

    nextPage() {
        if (this.currentPage < this.max) {
            this.setPage(this.currentPage + 1)
        }
    }

    setMax(newMax) {
        this.max = newMax || Math.floor(this.collection.length / this.perPage) + ((this.collection.length / this.perPage).toString().includes(".") && 1 || 0)
        this.pager.getElementsByClassName("pager-total")[0].textContent = this.max
    }

    constructPages(collection, perPage) {
        let pages = []
        for (let i = 0; i < collection.length; i += perPage) {
            pages.push(collection.slice(i, i + perPage))
        }
        this.collection = collection
        this.perPage = perPage
        this.pagerToggle();
        return [pages, Math.floor(collection.length / perPage) + ((collection.length / perPage).toString().includes(".") && 1 || 0)]
    }
}