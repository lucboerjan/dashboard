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
        Schema::create('aandelen_koersens', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignID('fondsID');
            $table->date('datum')->default(null)->nullable();
            $table->decimal('dagkoers',$precision=10, $scale=3)->default(0.000);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aandelen_koersens');
    }
};
