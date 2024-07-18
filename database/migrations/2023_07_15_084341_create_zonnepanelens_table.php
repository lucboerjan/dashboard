<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('zonnepanelens', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->date('datum')->default(null)->nullable();
            $table->decimal('tellerstand',$precision=10, $scale=2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zonnepanelens');
    }
};
